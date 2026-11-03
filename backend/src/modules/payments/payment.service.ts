import prisma from "../../prisma.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../common/errors/app-error.js";
import type {
  SubmitPaymentInput,
  CreatePackageInput,
  PaymentSettingInput,
} from "./payment.schema.js";

export class PaymentService {
  /**
   * Get active payment settings / instructions (Telebirr, bank details)
   */
  async getInstructions() {
    return prisma.paymentSetting.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Admin: Configure or create payment settings
   */
  async createPaymentSetting(data: PaymentSettingInput) {
    return prisma.paymentSetting.create({
      data,
    });
  }

  /**
   * List purchasable packages
   */
  async listPackages() {
    return prisma.package.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { price: "asc" },
    });
  }

  /**
   * Admin: Create package
   */
  async createPackage(data: CreatePackageInput) {
    return prisma.package.create({
      data,
    });
  }

  /**
   * Student: Submit payment evidence (receipt file + transaction ref)
   */
  async submitPayment(
    userId: string,
    data: SubmitPaymentInput,
    file?: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestError("A payment receipt image or PDF is required");
    }

    const { packageId, channel, transactionRef } = data;

    // Verify package exists and is active
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || pkg.status !== "PUBLISHED") {
      throw new NotFoundError("Selected package is not available");
    }

    // Check for duplicate pending or approved transactions
    const existing = await prisma.payment.findFirst({
      where: {
        channel: { equals: channel, mode: "insensitive" },
        transactionRef,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existing) {
      throw new ConflictError(
        "A payment with this transaction reference has already been submitted or approved"
      );
    }

    // Create payment in PENDING status
    const payment = await prisma.payment.create({
      data: {
        userId,
        packageId,
        amount: pkg.price,
        channel,
        transactionRef,
        receiptKey: file.filename,
        status: "PENDING",
      },
      include: {
        package: {
          select: { id: true, name: true, price: true, currency: true },
        },
      },
    });

    return payment;
  }

  /**
   * Student: View personal payment history and approval feedback
   */
  async listStudentPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      include: {
        package: {
          select: { id: true, name: true, price: true, currency: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin: List pending payments queue with filters
   */
  async listAdminPayments(status?: "PENDING" | "APPROVED" | "REJECTED") {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        package: {
          select: { id: true, name: true, price: true, currency: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin: Approve payment & activate entitlement atomically (FR-PAY-09, BR-10, BR-11)
   */
  async approvePayment(adminId: string, paymentId: string, decisionNote?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { package: true },
    });

    if (!payment) {
      throw new NotFoundError("Payment record not found");
    }

    if (payment.status !== "PENDING") {
      throw new ConflictError(
        `Payment cannot be approved because it has already been processed (Current status: ${payment.status})`
      );
    }

    const now = new Date();
    const pkg = payment.package;

    // Calculate entitlement expiration date
    let expiresAt: Date | null = null;
    if (pkg.durationDays) {
      expiresAt = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update Payment status to APPROVED
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          reviewedById: adminId,
          reviewedAt: now,
          decisionNote: decisionNote ?? "Payment verified and approved",
        },
      });

      // 2. Create matching active Entitlement
      const entitlement = await tx.entitlement.create({
        data: {
          userId: payment.userId,
          packageId: pkg.id,
          startsAt: now,
          expiresAt,
          remainingCredits: pkg.questionLimit ?? null,
          status: "ACTIVE",
          sourcePaymentId: payment.id,
        },
      });

      // 3. Log Audit Trail (FR-AUD-01)
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "PAYMENT_APPROVED",
          entityType: "PAYMENT",
          entityId: payment.id,
          metadata: {
            studentId: payment.userId,
            packageId: pkg.id,
            amount: payment.amount.toString(),
            decisionNote,
          },
        },
      });

      return {
        payment: updatedPayment,
        entitlement,
      };
    });
  }

  /**
   * Admin: Reject payment with required reason (FR-PAY-10)
   */
  async rejectPayment(adminId: string, paymentId: string, decisionNote: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundError("Payment record not found");
    }

    if (payment.status !== "PENDING") {
      throw new ConflictError(
        `Payment cannot be rejected because it has already been processed (Current status: ${payment.status})`
      );
    }

    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          reviewedById: adminId,
          reviewedAt: now,
          decisionNote,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "PAYMENT_REJECTED",
          entityType: "PAYMENT",
          entityId: payment.id,
          metadata: {
            studentId: payment.userId,
            reason: decisionNote,
          },
        },
      });

      return updatedPayment;
    });
  }
}

export const paymentService = new PaymentService();
