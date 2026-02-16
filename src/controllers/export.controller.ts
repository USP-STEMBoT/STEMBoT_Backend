// FILE PATH: src/controllers/export.controller.ts
// FILE DESCRIPTION: Controller for handling export requests

import { FastifyRequest, FastifyReply } from "fastify";
import { ExportService } from "../services/export.service";
import { ExportRequestDto } from "../dtos/export.dto";

export class ExportController {
  constructor(private exportService: ExportService) {}

  /**
   * Export chat history in various formats
   */
  async exportChatHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const exportDto = new ExportRequestDto(query);

      // Validate request
      const errors = exportDto.validate();
      if (errors.length > 0) {
        return reply.status(400).send({
          success: false,
          errors,
        });
      }

      // Parse dates if provided
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (exportDto.startDate && exportDto.endDate) {
        startDate = new Date(exportDto.startDate);
        endDate = new Date(exportDto.endDate);

        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
      }

      let buffer: Buffer | string;
      let contentType: string;
      let filename: string;

      const dateSuffix =
        startDate && endDate
          ? `_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`
          : "_all_time";

      switch (exportDto.format) {
        case "excel":
          buffer = await this.exportService.exportChatHistoryToExcel(
            startDate,
            endDate,
          );
          contentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          filename = `stempbot_chat_history${dateSuffix}.xlsx`;
          break;

        case "csv":
          buffer = await this.exportService.exportChatHistoryToCSV(
            startDate,
            endDate,
          );
          contentType = "text/csv";
          filename = `stempbot_chat_history${dateSuffix}.csv`;
          break;

        case "json":
          const jsonData = await this.exportService.exportChatHistoryToJSON(
            startDate,
            endDate,
          );
          buffer = JSON.stringify(jsonData, null, 2);
          contentType = "application/json";
          filename = `stempbot_chat_history${dateSuffix}.json`;
          break;

        default:
          return reply.status(400).send({
            success: false,
            error: "Unsupported export format",
          });
      }

      // Set headers for file download
      reply.header("Content-Type", contentType);
      reply.header("Content-Disposition", `attachment; filename="${filename}"`);
      reply.header("Content-Length", buffer.length.toString());

      // Send the file
      return reply.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get export options and available date range
   */
  async getExportInfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.status(200).send({
        success: true,
        data: {
          formats: [
            {
              format: "excel",
              description: "Microsoft Excel format (.xlsx)",
              recommended: true,
              features: [
                "Multiple sheets",
                "Formatted cells",
                "Charts support",
              ],
            },
            {
              format: "csv",
              description: "Comma Separated Values (.csv)",
              recommended: false,
              features: [
                "Simple format",
                "Universal compatibility",
                "Small file size",
              ],
            },
            {
              format: "json",
              description: "JavaScript Object Notation (.json)",
              recommended: false,
              features: ["Structured data", "Easy to parse", "Human readable"],
            },
          ],
          dateRange: {
            note: "Optional date range filter",
            format: "YYYY-MM-DD",
            example: "?startDate=2024-01-01&endDate=2024-01-31&format=excel",
          },
          endpoints: {
            export: "/api/export/chat-history",
            info: "/api/export/info",
          },
        },
      });
    } catch (error) {
      console.error("Export info error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Health check for export endpoints
   */
  async health(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      message: "Export API is running",
      timestamp: new Date().toISOString(),
      endpoints: [
        "/api/export/chat-history",
        "/api/export/info",
        "/api/export/health",
      ],
    });
  }
}
