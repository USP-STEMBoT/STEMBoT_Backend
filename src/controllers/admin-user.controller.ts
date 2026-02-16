// FILE PATH: src/controllers/admin-user.controller.ts
// FILE DESCRIPTION: Controller for AdminUser endpoints with integrated logging

import { FastifyRequest, FastifyReply } from "fastify";
import { IAdminUserService } from "../services/interfaces/IAdminUserService";
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  GetAdminUsersDto,
  AdminUserResponseDto,
} from "../dtos/admin-user.dto";

// Query/Params interfaces
interface GetAllAdminUsersQuery {
  userName?: string;
  userEmailAddress?: string;
  userAccountStatus?: string;
  createdAfter?: string;
  createdBefore?: string;
}
interface AdminUserIdParams {
  adminUserId: string;
}

export class AdminUserController {
  constructor(private adminService: IAdminUserService) {}

  async createAdminUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dto = new CreateAdminUserDto(request.body);

      const ipAddress = request.ip;
      const deviceInfo = request.headers["user-agent"] ?? "Unknown";

      const errors = dto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      // Pass IP/device to service to avoid duplicate logs
      const created = await this.adminService.createAdminUser(
        dto,
        ipAddress,
        deviceInfo,
      );

      return reply.status(201).send({ success: true, data: created });
    } catch (error) {
      console.error("Create admin error:", error);

      // Handle duplicate email error
      if (error instanceof Error && error.message.includes("already exists")) {
        return reply.status(409).send({
          success: false,
          error: "Conflict",
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

  async updateAdminUser(
    request: FastifyRequest<{ Params: AdminUserIdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { adminUserId } = request.params;
      const dto = new UpdateAdminUserDto(request.body);

      const errors = dto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      const updated = await this.adminService.updateAdminUser(
        adminUserId,
        dto,
        request.ip,
        request.headers["user-agent"] ?? "Unknown",
      );

      if (!updated) {
        return reply
          .status(404)
          .send({ success: false, error: "Admin user not found" });
      }

      return reply.status(200).send({ success: true, data: updated });
    } catch (error) {
      console.error("Update admin error:", error);

      // Handle duplicate email error
      if (error instanceof Error && error.message.includes("already exists")) {
        return reply.status(409).send({
          success: false,
          error: "Conflict",
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

  async deleteAdminUser(
    request: FastifyRequest<{ Params: AdminUserIdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { adminUserId } = request.params;

      const deleted = await this.adminService.deleteAdminUser(
        adminUserId,
        request.ip,
        request.headers["user-agent"] ?? "Unknown",
      );

      if (!deleted) {
        return reply
          .status(404)
          .send({ success: false, error: "Admin user not found" });
      }

      return reply
        .status(200)
        .send({ success: true, message: "Admin user deleted successfully" });
    } catch (error) {
      console.error("Delete admin error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAdminUserById(
    request: FastifyRequest<{ Params: AdminUserIdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { adminUserId } = request.params;
      const user = await this.adminService.getAdminUserById(adminUserId);

      if (!user) {
        return reply
          .status(404)
          .send({ success: false, error: "Admin user not found" });
      }

      return reply.status(200).send({ success: true, data: user });
    } catch (error) {
      console.error("Get admin by ID error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllAdminUsers(
    request: FastifyRequest<{ Querystring: GetAllAdminUsersQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const filters = new GetAdminUsersDto(request.query);
      const errors = filters.validate();
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      const users = await this.adminService.getAllAdminUsers(filters);
      return reply.status(200).send({ success: true, data: users });
    } catch (error) {
      console.error("Get all admins error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: "AdminUser API is running",
      timestamp: new Date().toISOString(),
    });
  }
}
