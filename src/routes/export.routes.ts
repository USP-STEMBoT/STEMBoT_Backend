// FILE PATH: src/routes/export.routes.ts
// FILE DESCRIPTION: Routes for export endpoints

import { FastifyInstance } from "fastify";
import { ExportController } from "../controllers/export.controller";

export async function exportRoutes(
  fastify: FastifyInstance,
  exportController: ExportController,
) {
  // Health check
  fastify.get("/health", exportController.health.bind(exportController));

  // Get export information
  fastify.get("/info", exportController.getExportInfo.bind(exportController));

  // Export chat history
  fastify.get(
    "/chat-history",
    exportController.exportChatHistory.bind(exportController),
  );
}
