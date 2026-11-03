import { prisma } from "../../prisma.js";
import { storageProvider } from "../../common/storage/index.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../common/errors/app-error.js";
import type {
  CreateResourceInput,
  UpdateResourceInput,
  QueryResourceInput,
} from "./resource.schema.js";
import type { AuthenticatedUser } from "../../common/types/index.js";

export class ResourceService {
  /**
   * Admin uploads a learning resource (PDF, guide, syllabus)
   */
  async createResource(
    actor: AuthenticatedUser,
    file: Express.Multer.File | undefined,
    data: CreateResourceInput
  ) {
    if (!file) {
      throw new BadRequestError("A resource file must be uploaded");
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new NotFoundError("Department not found");
    }

    // Upload to active storage provider under 'resources' directory
    const stored = await storageProvider.uploadFile(file, "resources");

    const resource = await prisma.resource.create({
      data: {
        departmentId: data.departmentId,
        title: data.title,
        description: data.description,
        topic: data.topic,
        fileKey: stored.key,
        mimeType: stored.mimeType,
        accessLevel: data.accessLevel,
        status: data.status,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "RESOURCE_UPLOADED",
        entityType: "RESOURCE",
        entityId: resource.id,
        metadata: {
          title: resource.title,
          departmentId: resource.departmentId,
          accessLevel: resource.accessLevel,
          fileKey: resource.fileKey,
        },
      },
    });

    return resource;
  }

  /**
   * List resources with role-aware access indicators
   */
  async listResources(user: AuthenticatedUser, query: QueryResourceInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const isStudent = user.role === "STUDENT";

    // Where clause construction
    const where: any = {};

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.topic) {
      where.topic = { contains: query.topic, mode: "insensitive" };
    }

    if (query.accessLevel) {
      where.accessLevel = query.accessLevel;
    }

    // Students only see PUBLISHED resources
    if (isStudent) {
      where.status = "PUBLISHED";
    } else if (query.status) {
      where.status = query.status;
    }

    // Check student active entitlements
    let hasUniversalAccess = false;
    const activeEntitlementDepartmentIds = new Set<string>();

    if (isStudent) {
      const activeEntitlements = await prisma.entitlement.findMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { departmentId: true },
      });

      for (const e of activeEntitlements) {
        if (!e.departmentId) {
          hasUniversalAccess = true;
        } else {
          activeEntitlementDepartmentIds.add(e.departmentId);
        }
      }
    }

    const [total, resources] = await Promise.all([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
    ]);

    // Format output with access entitlement indicator
    const data = resources.map((res) => {
      let hasAccess = true;
      if (isStudent) {
        if (res.accessLevel === "PAID") {
          hasAccess =
            hasUniversalAccess ||
            activeEntitlementDepartmentIds.has(res.departmentId);
        } else if (res.accessLevel === "TRIAL") {
          hasAccess = true;
        }
      }

      return {
        id: res.id,
        title: res.title,
        description: res.description,
        topic: res.topic,
        mimeType: res.mimeType,
        accessLevel: res.accessLevel,
        status: res.status,
        department: res.department,
        hasAccess,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get resource details by ID
   */
  async getResourceById(user: AuthenticatedUser, id: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    if (user.role === "STUDENT" && resource.status !== "PUBLISHED") {
      throw new NotFoundError("Resource not found");
    }

    let hasAccess = true;
    if (user.role === "STUDENT" && resource.accessLevel === "PAID") {
      const active = await prisma.entitlement.findFirst({
        where: {
          userId: user.id,
          status: "ACTIVE",
          OR: [
            { departmentId: null },
            { departmentId: resource.departmentId },
          ],
          AND: [
            {
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          ],
        },
      });
      hasAccess = !!active;
    }

    return {
      ...resource,
      hasAccess,
    };
  }

  /**
   * Secure URL generator for downloading / viewing resource
   * Enforces paywall checks for students (FR-RES-03, FR-ACCESS)
   */
  async getDownloadUrl(user: AuthenticatedUser, id: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    if (user.role === "STUDENT") {
      if (resource.status !== "PUBLISHED") {
        throw new NotFoundError("Resource not found");
      }

      // Check paywall
      if (resource.accessLevel === "PAID") {
        const activeEntitlement = await prisma.entitlement.findFirst({
          where: {
            userId: user.id,
            status: "ACTIVE",
            OR: [
              { departmentId: null },
              { departmentId: resource.departmentId },
            ],
            AND: [
              {
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
            ],
          },
        });

        if (!activeEntitlement) {
          throw new ForbiddenError(
            "This resource requires an active subscription for this department",
            "PAYWALL_REQUIRED"
          );
        }
      }
    }

    // Generate signed download URL (valid for 15 minutes / 900 seconds)
    const downloadUrl = await storageProvider.getSignedUrl(resource.fileKey, 900);

    return {
      resourceId: resource.id,
      title: resource.title,
      mimeType: resource.mimeType,
      downloadUrl,
      expiresInSeconds: 900,
    };
  }

  /**
   * Admin updates resource metadata or publication status
   */
  async updateResource(actor: AuthenticatedUser, id: string, data: UpdateResourceInput) {
    const existing = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Resource not found");
    }

    const updated = await prisma.resource.update({
      where: { id },
      data,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "RESOURCE_UPDATED",
        entityType: "RESOURCE",
        entityId: id,
        metadata: { updates: data },
      },
    });

    return updated;
  }

  /**
   * Admin deletes a resource and underlying file in storage
   */
  async deleteResource(actor: AuthenticatedUser, id: string) {
    const existing = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Resource not found");
    }

    // Delete file from storage provider
    await storageProvider.deleteFile(existing.fileKey);

    // Delete record
    await prisma.resource.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "RESOURCE_DELETED",
        entityType: "RESOURCE",
        entityId: id,
        metadata: { title: existing.title, fileKey: existing.fileKey },
      },
    });

    return { success: true, message: "Resource deleted successfully" };
  }
}

export const resourceService = new ResourceService();
