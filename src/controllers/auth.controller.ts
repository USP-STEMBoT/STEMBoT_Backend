// FILE PATH: src/controllers/auth.controller.ts
// FILE DESCRIPTION: Controller for authentication endpoints (login, logout)

import { FastifyRequest, FastifyReply } from "fastify";
import { IAuthService } from "../services/auth.service";
import { LoginDto, LoginResponseDto } from "../dtos/auth.dto";

interface LoginBody {
  identifier: string;
  password: string;
}

interface LogoutParams {
  adminUserId: string;
}

export class AuthController {
  constructor(private authService: IAuthService) {}

  /**
   * Health check endpoint
   */
  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: "Auth API is running",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Login endpoint
   */
  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ) {
    try {
      const dto = new LoginDto(request.body);

      const ipAddress = request.ip;
      const deviceInfo = request.headers["user-agent"] ?? "Unknown";

      const errors = dto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      // Authenticate user
      const { user } = await this.authService.login(dto, ipAddress, deviceInfo);

      // Generate JWT token
      const token = request.server.jwt.sign(
        {
          adminUserId: user.adminUserId,
          userName: user.userName,
          userEmailAddress: user.userEmailAddress,
        },
        { expiresIn: "24h" }, // Token expires in 24 hours
      );

      // Create response
      const response = new LoginResponseDto({ token, user });

      return reply.status(200).send(response);
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific errors
      if (
        error instanceof Error &&
        (error.message.includes("Invalid credentials") ||
          error.message.includes("not active"))
      ) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized",
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Logout endpoint
   */
  async logout(
    request: FastifyRequest<{ Params: LogoutParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { adminUserId } = request.params;

      const ipAddress = request.ip;
      const deviceInfo = request.headers["user-agent"] ?? "Unknown";

      const decoded = request.user;
      if (decoded.adminUserId !== adminUserId) {
        return reply.status(403).send({
          success: false,
          error: "Forbidden",
          message: "You can only logout your own account",
        });
      }

      const result = await this.authService.logout(
        adminUserId,
        ipAddress,
        deviceInfo,
      );

      return reply.status(200).send(result);
    } catch (error) {
      console.error("Logout error:", error);

      if (error instanceof Error && error.message.includes("not found")) {
        return reply.status(404).send({
          success: false,
          error: "Not found",
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get current user from JWT token
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const decoded = request.user;

      return reply.status(200).send({
        success: true,
        data: {
          adminUserId: decoded.adminUserId,
          userName: decoded.userName,
          userEmailAddress: decoded.userEmailAddress,
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
