// FILE PATH: src/dtos/admin-user.dto.ts
// FILE DESCRIPTION: Data Transfer Objects (DTOs) for AdminUser-related operations

/**
 * DTO for creating a new admin user
 */
export class CreateAdminUserDto {
  firstName: string;
  lastName: string;
  userName: string;
  userEmailAddress: string;
  password: string;
  userAccountStatus?: string;

  constructor(data: any) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.userName = data.userName;
    this.userEmailAddress = data.userEmailAddress;
    this.password = data.password;
    this.userAccountStatus = data.userAccountStatus || "ACTIVE";
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.firstName || this.firstName.trim().length === 0)
      errors.push("First name is required");
    if (!this.lastName || this.lastName.trim().length === 0)
      errors.push("Last name is required");
    if (!this.userName || this.userName.trim().length === 0)
      errors.push("Username is required");
    if (!this.userEmailAddress || this.userEmailAddress.trim().length === 0)
      errors.push("Email address is required");
    if (!this.password || this.password.trim().length === 0)
      errors.push("Password is required");
    return errors;
  }
}

/**
 * DTO for updating an existing admin user
 */
export class UpdateAdminUserDto {
  firstName?: string;
  lastName?: string;
  userName?: string;
  userEmailAddress?: string;
  password?: string;
  userAccountStatus?: string;
  isUserLoggedInFlag?: boolean;

  constructor(data: any) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.userName = data.userName;
    this.userEmailAddress = data.userEmailAddress;
    this.password = data.password;
    this.userAccountStatus = data.userAccountStatus;
    this.isUserLoggedInFlag = data.isUserLoggedInFlag;
  }

  validate(): string[] {
    const errors: string[] = [];
    // Optional: validate only if fields are provided
    if (this.firstName !== undefined && this.firstName.trim().length === 0)
      errors.push("First name cannot be empty");
    if (this.lastName !== undefined && this.lastName.trim().length === 0)
      errors.push("Last name cannot be empty");
    if (this.userName !== undefined && this.userName.trim().length === 0)
      errors.push("Username cannot be empty");
    if (
      this.userEmailAddress !== undefined &&
      this.userEmailAddress.trim().length === 0
    )
      errors.push("Email address cannot be empty");
    return errors;
  }
}

/**
 * DTO for a single admin user response
 */
export class AdminUserResponseDto {
  adminUserId: string;
  firstName: string;
  lastName: string;
  userName: string;
  userEmailAddress: string;
  userAccountStatus: string;
  userLastLoginTimeStamp?: Date;
  isUserLoggedInFlag: boolean;
  createdAt: Date;

  constructor(entity: any) {
    this.adminUserId = entity.adminUserId;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.userName = entity.userName;
    this.userEmailAddress = entity.userEmailAddress;
    this.userAccountStatus = entity.userAccountStatus;
    this.userLastLoginTimeStamp = entity.userLastLoginTimeStamp
      ? new Date(entity.userLastLoginTimeStamp)
      : undefined;
    this.isUserLoggedInFlag = entity.isUserLoggedInFlag;
    this.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt
        : new Date(entity.createdAt);
  }
}

/**
 * DTO for querying/filtering admin users
 */
export class GetAdminUsersDto {
  userName?: string;
  userEmailAddress?: string;
  userAccountStatus?: string;
  createdAfter?: Date;
  createdBefore?: Date;

  constructor(data: any) {
    this.userName = data.userName;
    this.userEmailAddress = data.userEmailAddress;
    this.userAccountStatus = data.userAccountStatus;
    this.createdAfter = data.createdAfter
      ? new Date(data.createdAfter)
      : undefined;
    this.createdBefore = data.createdBefore
      ? new Date(data.createdBefore)
      : undefined;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (this.createdAfter && isNaN(this.createdAfter.getTime()))
      errors.push("createdAfter is invalid");
    if (this.createdBefore && isNaN(this.createdBefore.getTime()))
      errors.push("createdBefore is invalid");
    if (
      this.createdAfter &&
      this.createdBefore &&
      this.createdAfter > this.createdBefore
    )
      errors.push("createdAfter cannot be after createdBefore");
    return errors;
  }
}
