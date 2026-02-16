// src/controllers/chat.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { IChatService } from "../services/interfaces/IChatService";
import { ChatRequestDto } from "../dtos/chat.dto";

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
}
