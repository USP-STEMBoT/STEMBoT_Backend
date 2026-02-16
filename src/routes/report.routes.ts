// FILE PATH: src/routes/report.routes.ts
// FILE DESCRIPTION: Routes for reporting endpoints

import { FastifyInstance } from "fastify";
import { ReportController } from "../controllers/report.controller";

export async function reportRoutes(
  fastify: FastifyInstance,
  reportController: ReportController,
) {
  // Health check
  fastify.get("/health", reportController.health.bind(reportController));

  // Total questions processed
  fastify.get(
    "/questions-processed",
    reportController.getQuestionsProcessed.bind(reportController),
  );

  // Cache hit rate
  fastify.get(
    "/cache-hit-rate",
    reportController.getCacheHitRate.bind(reportController),
  );

  // Cache utilization trends
  fastify.get(
    "/cache-utilization",
    reportController.getCacheUtilizationTrends.bind(reportController),
  );

  // New questions over time
  fastify.get(
    "/new-questions",
    reportController.getNewQuestionsOverTime.bind(reportController),
  );

  // QA growth rate
  fastify.get(
    "/qa-growth",
    reportController.getQAGrowthRate.bind(reportController),
  );
}
