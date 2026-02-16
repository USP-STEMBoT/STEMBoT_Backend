// FILE PATH: src/controllers/log.controller.ts
// FILE DESCRIPTION: Controller for log-related endpoints

// Imports
import { FastifyRequest, FastifyReply } from "fastify";
import { ILogService } from "../services/interfaces/ILogService";
import { CreateLogDto, GetLogsDto } from "../dtos/log.dto";

// Querystring interfaces
interface GetAllLogsQuery {
  actionType?: string;
  description?: string;
  ipAddress?: string;
  deviceInfo?: string;
  startDate?: string;
  endDate?: string;
}

interface GetRecentLogsQuery {
  limit?: string;
}

interface LogIdParams {
  logId: string;
}

export class LogController {
  constructor(private logService: ILogService) {}

  /**
   * Create a new log entry
   */
  async createLog(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Create DTO from request body
      const logDto = new CreateLogDto(request.body);

      // Extract IP and device info from request
      logDto.ipAddress = request.ip;
      logDto.deviceInfo = request.headers["user-agent"] ?? "Unknown";

      const errors = logDto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      const logResponse = await this.logService.createLog(logDto);

      return reply.status(201).send({ success: true, data: logResponse });
    } catch (error) {
      console.error("Create log error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all logs with optional filters
   */
  async getAllLogs(
    request: FastifyRequest<{ Querystring: GetAllLogsQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const filters = new GetLogsDto(request.query);

      const errors = filters.validate();
      if (errors.length > 0) {
        return reply.status(400).send({ success: false, errors });
      }

      const logs = await this.logService.getAllLogs(filters);

      return reply.status(200).send({ success: true, data: logs });
    } catch (error) {
      console.error("Get all logs error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get most recent logs
   */
  async getRecentLogs(
    request: FastifyRequest<{ Querystring: GetRecentLogsQuery }>,
    reply: FastifyReply,
  ) {
    try {
      const limit = Number(request.query.limit) || 10;

      if (limit <= 0) {
        return reply
          .status(400)
          .send({ success: false, error: "Limit must be > 0" });
      }

      const logs = await this.logService.getRecentLogs(limit);

      return reply.status(200).send({ success: true, data: logs });
    } catch (error) {
      console.error("Get recent logs error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get a log by its ID
   */
  async getLogById(
    request: FastifyRequest<{ Params: LogIdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { logId } = request.params;

      if (!logId) {
        return reply
          .status(400)
          .send({ success: false, error: "logId is required" });
      }

      const log = await this.logService.getLogById(logId);

      if (!log) {
        return reply
          .status(404)
          .send({ success: false, error: "Log not found" });
      }

      return reply.status(200).send({ success: true, data: log });
    } catch (error) {
      console.error("Get log by ID error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete a log by its ID
   */
  async deleteLog(
    request: FastifyRequest<{ Params: LogIdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const { logId } = request.params;

      if (!logId) {
        return reply
          .status(400)
          .send({ success: false, error: "logId is required" });
      }

      const deleted = await this.logService.deleteLog(logId);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: "Log not found or could not be deleted",
        });
      }

      return reply
        .status(200)
        .send({ success: true, message: "Log deleted successfully" });
    } catch (error) {
      console.error("Delete log error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Health check endpoint to verify the Log API is running
   */
  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: "Log API is running",
      timestamp: new Date().toISOString(),
    });
  }
}
