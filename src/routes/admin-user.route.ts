// FILE PATH: src/routes/admin-user.routes.ts
// FILE DESCRIPTION: Fastify routes for AdminUserController with descriptive route paths

// Imports
import { FastifyInstance } from "fastify";
import { AdminUserController } from "../controllers/admin-user.controller";

export async function adminUserRoutes(
  fastify: FastifyInstance,
  adminController: AdminUserController,
) {
  // Health check endpoint
  fastify.get(
    "/admin-users/health",
    adminController.health.bind(adminController),
  );

  // Create a new admin user
  fastify.post(
    "/admin-users/create",
    adminController.createAdminUser.bind(adminController),
  );

  // Update an existing admin user
  fastify.put(
    "/admin-users/update/:adminUserId",
    adminController.updateAdminUser.bind(adminController),
  );

  // Delete an admin user
  fastify.delete(
    "/admin-users/delete/:adminUserId",
    adminController.deleteAdminUser.bind(adminController),
  );

  // Get a single admin user by ID
  fastify.get(
    "/admin-users/get-one/:adminUserId",
    adminController.getAdminUserById.bind(adminController),
  );

  // Get all admin users with optional filters
  fastify.get(
    "/admin-users/get-all",
    adminController.getAllAdminUsers.bind(adminController),
  );
}
