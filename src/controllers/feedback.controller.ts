// FILE PATH: src/controllers/feedback.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { FeedbackService } from "../services/feedback.service";
import {
  CreateFeedbackRequestDto,
  GetFeedbackQueryRequestDto,
} from "../dtos/feedback.dto";

export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  /**
   * Submit student feedback
   */
  async submitFeedback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;
      const feedbackDto = new CreateFeedbackRequestDto(body);

      // Validate request
      const errors = feedbackDto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({
          success: false,
          errors,
        });
      }

      const feedback = await this.feedbackService.submitFeedback(
        feedbackDto.toCreateFeedbackDto(),
      );

      return reply.status(201).send({
        success: true,
        message: "Feedback submitted successfully",
        data: feedback,
      });
    } catch (error) {
      console.error("Submit feedback error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get all feedback (for admin dashboard)
   */
  async getAllFeedback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const queryDto = new GetFeedbackQueryRequestDto(query);

      const result = await this.feedbackService.getAllFeedback(
        queryDto.toGetFeedbackQueryDto(),
      );

      return reply.status(200).send({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get all feedback error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const feedback = await this.feedbackService.getFeedbackById(id);

      if (!feedback) {
        return reply.status(404).send({
          success: false,
          error: "Feedback not found",
        });
      }

      return reply.status(200).send({
        success: true,
        data: feedback,
      });
    } catch (error) {
      console.error("Get feedback by ID error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStatistics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.feedbackService.getFeedbackStatistics();

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get feedback statistics error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const deleted = await this.feedbackService.deleteFeedback(id);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: "Feedback not found or could not be deleted",
        });
      }

      return reply.status(200).send({
        success: true,
        message: "Feedback deleted successfully",
      });
    } catch (error) {
      console.error("Delete feedback error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Health check for feedback endpoints
   */
  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: "Feedback API is running",
      timestamp: new Date().toISOString(),
      endpoints: {
        public: ["/api/feedback/submit"],
        protected: [
          "/api/feedback/all",
          "/api/feedback/stats",
          "/api/feedback/:id",
          "DELETE /api/feedback/:id",
        ],
        info: "/api/feedback/info",
        health: "/api/feedback/health",
      },
    });
  }

  /**
   * Get feedback API info
   */
  async getFeedbackInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({
        success: true,
        data: {
          description: "Student Feedback API for STEMPBoT",
          version: "1.0.0",
          endpoints: [
            {
              method: "POST",
              path: "/api/feedback/submit",
              description: "Submit student feedback",
              authentication: "None",
              body: {
                studentName: "string (required)",
                studentID: "string (optional)",
                rating: "number (required, 1-5)",
                feedback: "string (required, min 10 chars)",
              },
            },
            {
              method: "GET",
              path: "/api/feedback/all",
              description: "Get all feedback with pagination",
              authentication: "Bearer Token",
              query: {
                page: "number (optional, default: 1)",
                limit: "number (optional, default: 20, max: 100)",
                rating: "number (optional, 1-5)",
                sortBy: "string (optional, 'submittedAt' or 'rating')",
                sortOrder: "string (optional, 'asc' or 'desc')",
                startDate: "string (optional, YYYY-MM-DD)",
                endDate: "string (optional, YYYY-MM-DD)",
              },
            },
            {
              method: "GET",
              path: "/api/feedback/stats",
              description: "Get feedback statistics",
              authentication: "Bearer Token",
            },
            {
              method: "GET",
              path: "/api/feedback/:id",
              description: "Get feedback by ID",
              authentication: "Bearer Token",
            },
            {
              method: "DELETE",
              path: "/api/feedback/:id",
              description: "Delete feedback",
              authentication: "Bearer Token",
            },
          ],
          formats: {
            dates: "ISO 8601 (YYYY-MM-DD)",
            responses: "JSON",
          },
        },
      });
    } catch (error) {
      console.error("Get feedback info error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
