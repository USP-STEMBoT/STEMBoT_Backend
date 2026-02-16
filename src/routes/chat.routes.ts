// src/routes/chat.routes.ts
import { FastifyInstance } from "fastify";
import { ChatController } from "../controllers/chat.controller";

export async function chatRoutes(
  fastify: FastifyInstance,
  chatController: ChatController,
) {
  // Health check endpoint
  fastify.get("/health", chatController.health.bind(chatController));

  // Main chat endpoint
  fastify.post("/api/chat", chatController.chat.bind(chatController));
}
