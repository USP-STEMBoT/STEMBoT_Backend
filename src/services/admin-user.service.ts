// FILE PATH: src/services/admin-user.service.ts
// FILE DESCRIPTION: Implementation of AdminUser service with integrated logging and argon2id password hashing

import { IAdminUserService } from "./interfaces/IAdminUserService";
import { IAdminUserRepository } from "../repositories/interfaces/IAdminUserRepository";
import { ILogService } from "./interfaces/ILogService";
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  GetAdminUsersDto,
  AdminUserResponseDto,
} from "../dtos/admin-user.dto";
import { CreateLogDto, LogResponseDto } from "../dtos/log.dto";
import { AdminUserEntity } from "../entities/admin-user.entity";
import crypto from "crypto";
import * as argon2 from "argon2";

export class AdminUserService implements IAdminUserService {
  private adminRepo: IAdminUserRepository;
  private logService: ILogService;

  constructor(adminRepo: IAdminUserRepository, logService: ILogService) {
    this.adminRepo = adminRepo;
    this.logService = logService;
  }

  /**
   * Create a new admin user
   */
  async createAdminUser(
    adminData: CreateAdminUserDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<AdminUserResponseDto> {
    const errors = adminData.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Check if email already exists
    const existingUser = await this.adminRepo.findByUsernameOrEmail(
      adminData.userEmailAddress,
    );
    if (existingUser) {
      throw new Error(
        `An admin user with email address '${adminData.userEmailAddress}' already exists`,
      );
    }

    // Hash password using argon2id before storing
    const hashedPassword = await this.hashPassword(adminData.password);

    const entity = new AdminUserEntity({
      adminUserId: crypto.randomUUID(),
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      userName: adminData.userName,
      userEmailAddress: adminData.userEmailAddress,
      password: hashedPassword,
      userAccountStatus: adminData.userAccountStatus || "ACTIVE",
      isUserLoggedInFlag: false,
      createdAt: new Date(),
    });

    const created = await this.adminRepo.create(entity);

    // Log action (only once, here)
    await this.logAdminAction(
      "CREATE_ADMIN",
      `Admin user ${created.userName} created.`,
      ipAddress,
      deviceInfo,
    );

    return new AdminUserResponseDto(created);
  }

  /**
   * Update an existing admin user
   */
  async updateAdminUser(
    adminUserId: string,
    adminData: UpdateAdminUserDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<AdminUserResponseDto | null> {
    const errors = adminData.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // If updating email, check if it's already taken by another user
    if (adminData.userEmailAddress) {
      const existingUser = await this.adminRepo.findByUsernameOrEmail(
        adminData.userEmailAddress,
      );
      if (existingUser && existingUser.adminUserId !== adminUserId) {
        throw new Error(
          `An admin user with email address '${adminData.userEmailAddress}' already exists`,
        );
      }
    }

    // Hash password if it's being updated using argon2id
    const updateData: any = { ...adminData };
    if (adminData.password) {
      updateData.password = await this.hashPassword(adminData.password);
    }

    const updated = await this.adminRepo.update(adminUserId, updateData);
    if (!updated) return null;

    await this.logAdminAction(
      "UPDATE_ADMIN",
      `Admin user ${updated.userName} updated.`,
      ipAddress,
      deviceInfo,
    );

    return new AdminUserResponseDto(updated);
  }

  /**
   * Delete an admin user
   */
  async deleteAdminUser(
    adminUserId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<boolean> {
    const deleted = await this.adminRepo.delete(adminUserId);
    if (deleted) {
      await this.logAdminAction(
        "DELETE_ADMIN",
        `Admin user with ID ${adminUserId} deleted.`,
        ipAddress,
        deviceInfo,
      );
    }
    return deleted;
  }

  async getAdminUserById(
    adminUserId: string,
  ): Promise<AdminUserResponseDto | null> {
    const user = await this.adminRepo.findById(adminUserId);
    return user ? new AdminUserResponseDto(user) : null;
  }

  async getAdminUserByUsernameOrEmail(
    identifier: string,
  ): Promise<AdminUserResponseDto | null> {
    const user = await this.adminRepo.findByUsernameOrEmail(identifier);
    return user ? new AdminUserResponseDto(user) : null;
  }

  async getAllAdminUsers(
    filters?: GetAdminUsersDto,
  ): Promise<AdminUserResponseDto[]> {
    const users = await this.adminRepo.findAll(filters);
    return users.map((user) => new AdminUserResponseDto(user));
  }

  /**
   * Hash a password using argon2id
   */
  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Log an admin-related action via ILogService
   */
  async logAdminAction(
    action: string,
    description: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<LogResponseDto> {
    const logDto = new CreateLogDto({
      actionType: action,
      description,
      ipAddress: ipAddress ?? "Unknown",
      deviceInfo: deviceInfo ?? "Unknown",
    });

    return this.logService.createLog(logDto);
  }
}
