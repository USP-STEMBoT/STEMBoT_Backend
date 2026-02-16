// FILE PATH: src/controllers/report.controller.ts
// FILE DESCRIPTION: Controller for handling report requests

import { FastifyRequest, FastifyReply } from "fastify";
import { ReportService } from "../services/report.service";
import { DateRangeRequestDto, TimePeriodRequestDto } from "../dtos/report.dto";

export class ReportController {
  constructor(private reportService: ReportService) {}

  /**
   * Get total questions processed
   */
  async getQuestionsProcessed(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return reply.status(400).send({
            success: false,
            error: "Invalid date format. Use ISO format (YYYY-MM-DD)",
          });
        }
      }

      const result = await this.reportService.getQuestionsProcessed(
        startDate,
        endDate,
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in getQuestionsProcessed:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get cache hit rate
   */
  async getCacheHitRate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return reply.status(400).send({
            success: false,
            error: "Invalid date format. Use ISO format (YYYY-MM-DD)",
          });
        }
      }

      const result = await this.reportService.getCacheHitRate(
        startDate,
        endDate,
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in getCacheHitRate:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get cache utilization trends
   */
  async getCacheUtilizationTrends(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const query = request.query as any;
      const periodDto = new TimePeriodRequestDto(query);

      const errors = periodDto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({
          success: false,
          errors,
        });
      }

      const result = await this.reportService.getCacheUtilizationTrends(
        periodDto.period,
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in getCacheUtilizationTrends:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get new questions over time
   */
  async getNewQuestionsOverTime(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const periodDto = new TimePeriodRequestDto(query);

      const errors = periodDto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({
          success: false,
          errors,
        });
      }

      const result = await this.reportService.getNewQuestionsOverTime(
        periodDto.period,
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in getNewQuestionsOverTime:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get QA growth rate
   */
  async getQAGrowthRate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const periodDto = new TimePeriodRequestDto(query);

      const errors = periodDto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({
          success: false,
          errors,
        });
      }

      const result = await this.reportService.getQAGrowthRate(periodDto.period);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in getQAGrowthRate:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Health check for reports
   */
  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: "Reports API is running",
      timestamp: new Date().toISOString(),
      endpoints: [
        "/api/reports/questions-processed",
        "/api/reports/cache-hit-rate",
        "/api/reports/cache-utilization",
        "/api/reports/new-questions",
        "/api/reports/qa-growth",
      ],
    });
  }
}
