// FILE PATH: src/services/auth.service.ts

import * as argon2 from "argon2";
import { IAdminUserRepository } from "../repositories/interfaces/IAdminUserRepository";
import { ILogService } from "./interfaces/ILogService";
import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
} from "../dtos/auth.dto";
import { CreateLogDto } from "../dtos/log.dto";

export interface IAuthService {
  login(
    loginData: LoginDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<{ user: any }>;
  logout(
    adminUserId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<LogoutResponseDto>;
  verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export class AuthService implements IAuthService {
  private adminRepo: IAdminUserRepository;
  private logService: ILogService;
  private jwtSecret: string;

  constructor(
    adminRepo: IAdminUserRepository,
    logService: ILogService,
    jwtSecret: string,
  ) {
    this.adminRepo = adminRepo;
    this.logService = logService;
    this.jwtSecret = jwtSecret;
  }

  async login(
    loginData: LoginDto,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<{ user: any }> {
    const errors = loginData.validate();
    if (errors.length > 0)
      throw new Error(`Validation failed: ${errors.join(", ")}`);

    const user = await this.adminRepo.findByUsernameOrEmail(
      loginData.identifier,
    );
    if (!user) {
      await this.logAuthAction(
        "LOGIN_FAILED",
        `Failed login attempt for identifier: ${loginData.identifier}`,
        ipAddress,
        deviceInfo,
      );
      throw new Error("Invalid credentials");
    }

    if (user.userAccountStatus !== "ACTIVE") {
      await this.logAuthAction(
        "LOGIN_FAILED",
        `Login attempt for inactive account: ${user.userName}`,
        ipAddress,
        deviceInfo,
      );
      throw new Error("Account is not active");
    }

    const isPasswordValid = await this.verifyPassword(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      await this.logAuthAction(
        "LOGIN_FAILED",
        `Invalid password for user: ${user.userName}`,
        ipAddress,
        deviceInfo,
      );
      throw new Error("Invalid credentials");
    }

    await this.adminRepo.update(user.adminUserId, {
      isUserLoggedInFlag: true,
      userLastLoginTimeStamp: new Date(),
    });

    await this.logAuthAction(
      "LOGIN_SUCCESS",
      `User ${user.userName} logged in successfully`,
      ipAddress,
      deviceInfo,
    );

    return {
      user: {
        adminUserId: user.adminUserId,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        userEmailAddress: user.userEmailAddress,
        userAccountStatus: user.userAccountStatus,
      },
    };
  }

  async logout(
    adminUserId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<LogoutResponseDto> {
    const user = await this.adminRepo.findById(adminUserId);
    if (!user) throw new Error("User not found");

    await this.adminRepo.update(adminUserId, { isUserLoggedInFlag: false });
    await this.logAuthAction(
      "LOGOUT",
      `User ${user.userName} logged out`,
      ipAddress,
      deviceInfo,
    );

    return new LogoutResponseDto();
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      return false;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  private async logAuthAction(
    action: string,
    description: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<void> {
    const logDto = new CreateLogDto({
      actionType: action,
      description,
      ipAddress: ipAddress ?? "Unknown",
      deviceInfo: deviceInfo ?? "Unknown",
    });
    await this.logService.createLog(logDto);
  }
}
