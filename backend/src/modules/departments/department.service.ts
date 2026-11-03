
import prisma from "../../prisma.js";
import { ConflictError } from "../../common/errors/app-error.js";

export class DepartmentService {
  async listActive() {
    return prisma.department.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async create(data: { code: string; name: string; description?: string }) {
    const existing = await prisma.department.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictError(`Department with code ${data.code} already exists`);
    }

    return prisma.department.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        status: "ACTIVE",
      },
    });
  }
}

export const departmentService = new DepartmentService();
