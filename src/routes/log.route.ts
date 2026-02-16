// FILE PATH: src/routes/log.routes.ts
// FILE DESCRIPTION: Fastify routes for LogController with descriptive route paths

// Imports
import { FastifyInstance } from "fastify";
import { LogController } from "../controllers/log.controller";

export async function logRoutes(
  fastify: FastifyInstance,
  logController: LogController,
) {
  // Health check endpoint
  fastify.get("/logs/health", logController.health.bind(logController));

  // Create a new log
  fastify.post("/logs/create", logController.createLog.bind(logController));

  // Get all logs with optional filters (query parameters)
  fastify.get("/logs/get-all", logController.getAllLogs.bind(logController));

  // Get most recent logs with optional limit query parameter
  fastify.get(
    "/logs/get-recent",
    logController.getRecentLogs.bind(logController),
  );

  // Get a single log by its ID
  fastify.get(
    "/logs/get-one/:logId",
    logController.getLogById.bind(logController),
  );

  // Delete a log by its ID
  fastify.delete(
    "/logs/delete/:logId",
    logController.deleteLog.bind(logController),
  );
}
