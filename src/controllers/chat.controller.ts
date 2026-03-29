// src/controllers/chat.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { IChatService } from "../services/interfaces/IChatService";
import { ChatRequestDto } from "../dtos/chat.dto";
import * as XLSX from "xlsx";

export class ChatController {
  constructor(private chatService: IChatService) {}

  async chat(request: FastifyRequest, reply: FastifyReply) {
    try {
      const chatRequest = new ChatRequestDto(request.body);

      // Validate request
      const errors = chatRequest.validate();
      if (errors.length > 0) {
        return reply.status(400).send({
          success: false,
          errors,
        });
      }

      // Process the question
      const response = await this.chatService.processQuestion(
        chatRequest.question,
      );

      return reply.status(200).send({
        success: true,
        data: {
          question: chatRequest.question,
          answer: response.answer,
          source: response.source,
          confidence: response.confidence,
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
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
      message: "Chatbot API is running",
      timestamp: new Date().toISOString(),
    });
  }

  async deleteBatch(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Retrieve the uploaded file
      const data = await request.file(); // uses fastify-multipart
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: "No file uploaded",
        });
      }

      // 2. Read the file buffer
      const buffer = await data.toBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // 3. Convert sheet to JSON, assuming the first column contains the IDs
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      if (!rows || rows.length === 0) {
        return reply.status(400).send({
          success: false,
          error: "Excel file is empty",
        });
      }

      // Determine if there's a header row – we can skip if the first row contains non-UUID strings
      // Simpler: assume the first column (index 0) of each row is the ID, and skip header if it looks like a label.
      const ids: string[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row || row.length === 0) continue;

        let cellValue = row[0];
        if (cellValue && typeof cellValue === "string") {
          cellValue = cellValue.trim();
          // Skip if it's a header row (e.g., "ChatHistoryId" or empty)
          if (cellValue.toLowerCase() === "chathistoryid" || cellValue === "") {
            continue;
          }
          ids.push(cellValue);
        }
      }

      if (ids.length === 0) {
        return reply.status(400).send({
          success: false,
          error: "No valid IDs found in the Excel file",
        });
      }

      // 4. Call service to delete
      const deletedCount = await this.chatService.deleteChatHistoriesByIds(ids);

      return reply.status(200).send({
        success: true,
        data: {
          deletedCount,
          ids: ids,
        },
      });
    } catch (error) {
      console.error("Delete batch error:", error);
      return reply.status(500).send({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
