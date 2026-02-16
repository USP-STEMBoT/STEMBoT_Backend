// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";
import os from "os";
import type { NetworkInterfaceInfo } from "os";
import { PrismaClient } from "@prisma/client";

// Repositories
import { QuestionRepository } from "./repositories/question.repository";
import { ChatHistoryRepository } from "./repositories/chat-history.repository";
import { LogRepository } from "./repositories/log.repository";
import { AdminUserRepository } from "./repositories/admin-user.repository";

// Services
import { OpenAIService } from "./services/openai.service";
import { QuestionService } from "./services/question.service";
import { ChatService } from "./services/chat.service";
import { LogService } from "./services/log.service";
import { AdminUserService } from "./services/admin-user.service";
import { AuthService } from "./services/auth.service";
import { ReportService } from "./services/report.service";
import { ExportService } from "./services/export.service";

// Controllers
import { ChatController } from "./controllers/chat.controller";
import { LogController } from "./controllers/log.controller";
import { AdminUserController } from "./controllers/admin-user.controller";
import { AuthController } from "./controllers/auth.controller";
import { ReportController } from "./controllers/report.controller";
import { ExportController } from "./controllers/export.controller";

// Routes
import { chatRoutes } from "./routes/chat.routes";
import { logRoutes } from "./routes/log.route";
import { adminUserRoutes } from "./routes/admin-user.route";
import { authRoutes } from "./routes/auth.route";
import { reportRoutes } from "./routes/report.routes";
import { exportRoutes } from "./routes/export.routes";
import { feedbackRoutes } from "./routes/feedback.routes";

// Plugins
import jwtPlugin from "./plugins/jwt.plugin";

dotenv.config();

const prisma = new PrismaClient();

const fastify = Fastify({
  logger: true,
});

/**
 * Safely get the first non-internal IPv4 address
 */
function getLocalIPv4(): string {
  const interfaces = os.networkInterfaces();

  return (
    Object.values(interfaces)
      .flat()
      .filter(
        (iface): iface is NetworkInterfaceInfo =>
          iface !== undefined && iface.family === "IPv4" && !iface.internal,
      )[0]?.address || "localhost"
  );
}

async function startServer() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true,
    });

    // Register JWT
    const jwtSecret =
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    await fastify.register(jwt, {
      secret: jwtSecret,
    });

    // Register JWT plugin (authentication decorator)
    await fastify.register(jwtPlugin);

    // Initialize repositories
    const questionRepo = new QuestionRepository(prisma);
    const chatHistoryRepo = new ChatHistoryRepository(prisma);
    const logRepo = new LogRepository(prisma);
    const adminUserRepo = new AdminUserRepository(prisma);

    // Initialize services
    const openaiService = new OpenAIService();
    const questionService = new QuestionService(questionRepo, openaiService);
    const logService = new LogService(logRepo);
    const adminUserService = new AdminUserService(adminUserRepo, logService);
    const authService = new AuthService(adminUserRepo, logService, jwtSecret);
    const reportService = new ReportService(questionRepo, chatHistoryRepo);
    const exportService = new ExportService(chatHistoryRepo);

    const chatService = new ChatService(
      questionService,
      openaiService,
      chatHistoryRepo,
    );

    // Initialize controllers
    const chatController = new ChatController(chatService);
    const logController = new LogController(logService);
    const adminUserController = new AdminUserController(adminUserService);
    const authController = new AuthController(authService);
    const reportController = new ReportController(reportService);
    const exportController = new ExportController(exportService);

    // Register routes
    await chatRoutes(fastify, chatController);
    await fastify.register(
      async (instance) => {
        await logRoutes(instance, logController);
      },
      { prefix: "/api" },
    );
    await fastify.register(
      async (instance) => {
        await adminUserRoutes(instance, adminUserController);
      },
      { prefix: "/api" },
    );
    await fastify.register(
      async (instance) => {
        await authRoutes(instance, authController);
      },
      { prefix: "/api" },
    );
    await fastify.register(
      async (instance) => {
        await reportRoutes(instance, reportController);
      },
      { prefix: "/api/reports" },
    );
    await fastify.register(
      async (instance) => {
        await exportRoutes(instance, exportController);
      },
      { prefix: "/api/export" },
    );
    await fastify.register(feedbackRoutes);

    // Start server
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: "0.0.0.0" });

    const localIP = getLocalIPv4();

    fastify.log.info("🚀 Server is running");
    fastify.log.info(`📍 Local:   http://localhost:${port}`);
    fastify.log.info(`📍 Network: http://${localIP}:${port}`);
    fastify.log.info(`📡 Health:  http://${localIP}:${port}/health`);
    fastify.log.info(`💬 Chat:    http://${localIP}:${port}/api/chat`);
    fastify.log.info(`📝 Logs:    http://${localIP}:${port}/api/logs/health`);
    fastify.log.info(
      `👤 Admin:   http://${localIP}:${port}/api/admin-users/health`,
    );
    fastify.log.info(`🔐 Auth:    http://${localIP}:${port}/api/auth/health`);
    fastify.log.info(`🔑 Login:   http://${localIP}:${port}/api/auth/login`);
    fastify.log.info(
      `📊 Reports:   http://${localIP}:${port}/api/reports/health`,
    );
    fastify.log.info(
      `📥 Export:    http://${localIP}:${port}/api/export/health`,
    );
  } catch (error) {
    fastify.log.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  fastify.log.info("🛑 Shutting down...");
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
