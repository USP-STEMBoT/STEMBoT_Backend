// FILE PATH: src/entities/admin-user.entity.ts

/**
 * ENTITY NAME: AdminUserEntity
 * ENTITY DESCRIPTION:
 * Domain representation of the AdminUser model.
 * Stores administrator account details and
 * authentication-related information.
 */
export class AdminUserEntity {
  /**
   * Unique identifier of the admin user
   * Maps to Prisma field: adminUserId
   * DB column: AdminUserId
   */
  adminUserId: string;

  /**
   * Administrator first name
   * Maps to Prisma field: firstName
   * DB column: FirstName
   */
  firstName: string;

  /**
   * Administrator last name
   * Maps to Prisma field: lastName
   * DB column: LastName
   */
  lastName: string;

  /**
   * Record creation timestamp
   * Maps to Prisma field: createdAt
   * DB column: CreatedAt
   */
  createdAt: Date;

  /**
   * Hashed password
   * Maps to Prisma field: password
   * DB column: Password
   */
  password: string;

  /**
   * Administrator email address
   * Maps to Prisma field: userEmailAddress
   * DB column: UserEmailAddress
   */
  userEmailAddress: string;

  /**
   * Administrator username
   * Maps to Prisma field: userName
   * DB column: UserName
   */
  userName: string;

  /**
   * Account status of the administrator
   * Maps to Prisma field: userAccountStatus
   * DB column: UserAccountStatus
   */
  userAccountStatus: string;

  /**
   * Timestamp of the user's last successful login
   * Maps to Prisma field: userLastLoginTimeStamp
   * DB column: UserLastLoginTimeStamp
   */
  userLastLoginTimeStamp?: Date;

  /**
   * Indicates whether the user is currently logged in
   * Maps to Prisma field: isUserLoggedInFlag
   * DB column: IsUserLoggedInFlag
   */
  isUserLoggedInFlag: boolean;

  /**
   * Constructs an AdminUserEntity.
   */
  constructor(data: any) {
    this.adminUserId = data.adminUserId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;

    // Normalize createdAt to a Date instance
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);

    this.password = data.password;
    this.userEmailAddress = data.userEmailAddress;
    this.userName = data.userName;
    this.userAccountStatus = data.userAccountStatus;

    // Normalize last login timestamp
    this.userLastLoginTimeStamp = data.userLastLoginTimeStamp
      ? data.userLastLoginTimeStamp instanceof Date
        ? data.userLastLoginTimeStamp
        : new Date(data.userLastLoginTimeStamp)
      : undefined;

    this.isUserLoggedInFlag = data.isUserLoggedInFlag;
  }
}
