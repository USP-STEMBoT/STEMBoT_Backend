// FILE PATH: src/repositories/admin-user.repository.ts
// FILE DESCRIPTION: Implementation of AdminUser repository using Prisma

import { PrismaClient } from "@prisma/client";
import { IAdminUserRepository } from "./interfaces/IAdminUserRepository";
import { AdminUserEntity } from "../entities/admin-user.entity";
import { GetAdminUsersDto } from "../dtos/admin-user.dto";

export class AdminUserRepository implements IAdminUserRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Create a new admin user
   */
  async create(adminData: AdminUserEntity): Promise<AdminUserEntity> {
    const created = await this.prisma.adminUser.create({
      data: {
        adminUserId: adminData.adminUserId,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        password: adminData.password,
        userEmailAddress: adminData.userEmailAddress,
        userName: adminData.userName,
        userAccountStatus: adminData.userAccountStatus,
        isUserLoggedInFlag: adminData.isUserLoggedInFlag,
        createdAt: adminData.createdAt,
        userLastLoginTimeStamp: adminData.userLastLoginTimeStamp,
      },
    });
    return new AdminUserEntity(created);
  }

  /**
   * Update an existing admin user by ID
   */
  async update(
    adminUserId: string,
    adminData: Partial<AdminUserEntity>,
  ): Promise<AdminUserEntity | null> {
    try {
      const updated = await this.prisma.adminUser.update({
        where: { adminUserId },
        data: adminData,
      });
      return new AdminUserEntity(updated);
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete an admin user by ID
   */
  async delete(adminUserId: string): Promise<boolean> {
    try {
      await this.prisma.adminUser.delete({
        where: { adminUserId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find a single admin user by ID
   */
  async findById(adminUserId: string): Promise<AdminUserEntity | null> {
    const user = await this.prisma.adminUser.findUnique({
      where: { adminUserId },
    });
    return user ? new AdminUserEntity(user) : null;
  }

  /**
   * Find a single admin user by username or email
   */
  async findByUsernameOrEmail(
    identifier: string,
  ): Promise<AdminUserEntity | null> {
    const user = await this.prisma.adminUser.findFirst({
      where: {
        OR: [{ userName: identifier }, { userEmailAddress: identifier }],
      },
    });
    return user ? new AdminUserEntity(user) : null;
  }

  /**
   * Get all admin users with optional filters
   */
  async findAll(filters?: GetAdminUsersDto): Promise<AdminUserEntity[]> {
    const where: any = {};

    if (filters) {
      if (filters.userName) {
        where.userName = { contains: filters.userName, mode: "insensitive" };
      }
      if (filters.userEmailAddress) {
        where.userEmailAddress = {
          contains: filters.userEmailAddress,
          mode: "insensitive",
        };
      }
      if (filters.userAccountStatus) {
        where.userAccountStatus = filters.userAccountStatus;
      }
      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
        if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
      }
    }

    const users = await this.prisma.adminUser.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return users.map((user: any) => new AdminUserEntity(user));
  }
}
