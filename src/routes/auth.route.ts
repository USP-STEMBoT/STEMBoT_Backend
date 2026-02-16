// FILE PATH: src/routes/auth.routes.ts
// FILE DESCRIPTION: Fastify routes for AuthController with descriptive route paths

import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";

// Define route type interfaces
interface LoginRouteRequest {
  Body: {
    identifier: string;
    password: string;
  };
}

interface LogoutRouteRequest {
  Params: {
    adminUserId: string;
  };
}

export async function authRoutes(
  fastify: FastifyInstance,
  authController: AuthController,
) {
  // Health check endpoint
  fastify.get("/auth/health", authController.health.bind(authController));

  // Login endpoint (public)
  fastify.post<LoginRouteRequest>(
    "/auth/login",
    authController.login.bind(authController),
  );

  // Logout endpoint (protected)
  fastify.post<LogoutRouteRequest>(
    "/auth/logout/:adminUserId",
    {
      onRequest: [fastify.authenticate],
    },
    authController.logout.bind(authController),
  );

  // Get current user endpoint (protected)
  fastify.get(
    "/auth/me",
    {
      onRequest: [fastify.authenticate],
    },
    authController.getCurrentUser.bind(authController),
  );
}
