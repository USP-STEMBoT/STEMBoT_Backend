// FILE PATH: src/repositories/interfaces/IAdminUserRepository.ts
// FILE DESCRIPTION: Interface for AdminUser repository operations

import { AdminUserEntity } from "../../entities/admin-user.entity";
import { GetAdminUsersDto } from "../../dtos/admin-user.dto";

export interface IAdminUserRepository {
  /**
   * Create a new admin user
   * @param adminData AdminUserEntity
   * @returns Promise resolving to the created AdminUserEntity
   */
  create(adminData: AdminUserEntity): Promise<AdminUserEntity>;

  /**
   * Update an existing admin user by ID
   * @param adminUserId ID of the admin user to update
   * @param adminData Partial admin data for update
   * @returns Promise resolving to the updated AdminUserEntity or null if not found
   */
  update(
    adminUserId: string,
    adminData: Partial<AdminUserEntity>,
  ): Promise<AdminUserEntity | null>;

  /**
   * Delete an admin user by ID
   * @param adminUserId ID of the admin user to delete
   * @returns Promise resolving to boolean indicating success
   */
  delete(adminUserId: string): Promise<boolean>;

  /**
   * Find a single admin user by ID
   * @param adminUserId ID of the admin user
   * @returns Promise resolving to AdminUserEntity or null if not found
   */
  findById(adminUserId: string): Promise<AdminUserEntity | null>;

  /**
   * Find a single admin user by username or email
   * @param identifier username or email
   * @returns Promise resolving to AdminUserEntity or null if not found
   */
  findByUsernameOrEmail(identifier: string): Promise<AdminUserEntity | null>;

  /**
   * Get all admin users with optional filters
   * @param filters Optional GetAdminUsersDto filters
   * @returns Promise resolving to an array of AdminUserEntity
   */
  findAll(filters?: GetAdminUsersDto): Promise<AdminUserEntity[]>;
}
