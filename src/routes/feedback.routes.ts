// FILE PATH: src/routes/feedback.routes.ts
import { FastifyInstance } from "fastify";
import { FeedbackController } from "../controllers/feedback.controller";
import { FeedbackService } from "../services/feedback.service";
import { FeedbackRepository } from "../repositories/feedback.repository";

// Optional authentication middleware
const authenticate = async (request: any, reply: any) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: "Authentication required",
    });
  }

  // Validate token (you would implement your own token validation logic)
  const token = authHeader.substring(7);
  // Add your token validation logic here

  // For now, just allow all
  return;
};

export async function feedbackRoutes(fastify: FastifyInstance) {
  // Initialize dependencies
  const feedbackRepository = new FeedbackRepository();
  const feedbackService = new FeedbackService(feedbackRepository);
  const feedbackController = new FeedbackController(feedbackService);

  // Public routes
  fastify.post(
    "/api/feedback/submit",
    {
      schema: {
        description: "Submit student feedback",
        tags: ["feedback"],
        body: {
          type: "object",
          required: ["studentName", "rating", "feedback"],
          properties: {
            studentName: { type: "string" },
            studentID: { type: "string" },
            rating: { type: "number", minimum: 1, maximum: 5 },
            feedback: { type: "string", minLength: 10 },
          },
        },
        response: {
          201: {
            description: "Feedback submitted successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  studentName: { type: "string" },
                  studentID: { type: ["string", "null"] },
                  rating: { type: "number" },
                  feedbackText: { type: "string" },
                  submittedAt: { type: "string" },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean" },
              errors: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    feedbackController.submitFeedback.bind(feedbackController),
  );

  // Protected routes (add authentication)
  fastify.get(
    "/api/feedback/all",
    {
      preHandler: [authenticate],
      schema: {
        description: "Get all feedback with pagination",
        tags: ["feedback"],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", minimum: 1 },
            limit: { type: "number", minimum: 1, maximum: 100 },
            rating: { type: "number", minimum: 1, maximum: 5 },
            sortBy: { type: "string", enum: ["submittedAt", "rating"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
            startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
            endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          },
        },
      },
    },
    feedbackController.getAllFeedback.bind(feedbackController),
  );

  fastify.get(
    "/api/feedback/stats",
    {
      preHandler: [authenticate],
    },
    feedbackController.getFeedbackStatistics.bind(feedbackController),
  );

  fastify.get(
    "/api/feedback/:id",
    {
      preHandler: [authenticate],
      schema: {
        description: "Get feedback by ID",
        tags: ["feedback"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    feedbackController.getFeedbackById.bind(feedbackController),
  );

  fastify.delete(
    "/api/feedback/:id",
    {
      preHandler: [authenticate],
      schema: {
        description: "Delete feedback",
        tags: ["feedback"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    feedbackController.deleteFeedback.bind(feedbackController),
  );

  // Info and health endpoints
  fastify.get(
    "/api/feedback/info",
    feedbackController.getFeedbackInfo.bind(feedbackController),
  );

  fastify.get(
    "/api/feedback/health",
    feedbackController.health.bind(feedbackController),
  );
}
