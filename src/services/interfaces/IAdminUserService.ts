// FILE PATH: src/services/interfaces/IAdminUserService.ts
// FILE DESCRIPTION: Interface for AdminUser service operations, including optional logging

import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  GetAdminUsersDto,
  AdminUserResponseDto,
} from "../../dtos/admin-user.dto";
import { LogResponseDto } from "../../dtos/log.dto";

export interface IAdminUserService {
  /**
   * Create a new admin user
   * @param adminData Data required to create an admin user
   * @returns Promise resolving to AdminUserResponseDto
   */
  createAdminUser(
    adminData: CreateAdminUserDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<AdminUserResponseDto>;

  /**
   * Update an existing admin user
   * @param adminUserId ID of the admin user to update
   * @param adminData Data to update
   * @returns Promise resolving to AdminUserResponseDto or null if not found
   */
  updateAdminUser(
    adminUserId: string,
    adminData: UpdateAdminUserDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<AdminUserResponseDto | null>;

  /**
   * Delete an admin user by ID
   * @param adminUserId ID of the admin user to delete
   * @returns Promise resolving to boolean indicating success
   */
  deleteAdminUser(
    adminUserId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<boolean>;

  /**
   * Find a single admin user by ID
   * @param adminUserId ID of the admin user
   * @returns Promise resolving to AdminUserResponseDto or null if not found
   */
  getAdminUserById(adminUserId: string): Promise<AdminUserResponseDto | null>;

  /**
   * Find a single admin user by username or email
   * @param identifier Username or email
   * @returns Promise resolving to AdminUserResponseDto or null if not found
   */
  getAdminUserByUsernameOrEmail(
    identifier: string,
  ): Promise<AdminUserResponseDto | null>;

  /**
   * Fetch all admin users with optional filters
   * @param filters Optional filtering parameters
   * @returns Promise resolving to array of AdminUserResponseDto
   */
  getAllAdminUsers(filters?: GetAdminUsersDto): Promise<AdminUserResponseDto[]>;

  /**
   * Optional: Log an admin-related action
   * @param action Description of the action (e.g., "CREATE_ADMIN", "DELETE_ADMIN")
   * @param description Detailed description of the action
   * @returns Promise resolving to LogResponseDto
   */
  logAdminAction(action: string, description: string): Promise<LogResponseDto>;
}
