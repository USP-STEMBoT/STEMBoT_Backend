// FILE PATH: scripts/seed.ts
// FILE DESCRIPTION:
// Database seeding script to initialize essential data.
// Creates a Super Admin user if one does not already exist.
// Utilizes Prisma Client for database interactions and Argon2 for secure password hashing.

// Imports
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Create Prisma Client instance
const prisma = new PrismaClient();

// Main seeding function
async function main() {
  console.log("🌱 Running database seed...");

  // Pull Super Admin credentials from environment variables (.env file)
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
  const SUPER_ADMIN_FIRSTNAME = process.env.SUPER_ADMIN_FIRSTNAME;
  const SUPER_ADMIN_LASTNAME = process.env.SUPER_ADMIN_LASTNAME;

  // Ensure all required credentials are present before running the seed
  if (
    !SUPER_ADMIN_EMAIL ||
    !SUPER_ADMIN_USERNAME ||
    !SUPER_ADMIN_PASSWORD ||
    !SUPER_ADMIN_FIRSTNAME ||
    !SUPER_ADMIN_LASTNAME
  ) {
    throw new Error(
      "❌ Missing Super Admin credentials in environment variables",
    );
  }

  // Check if a Super Admin with this email already exists in the database and prevent duplicates.
  const existingAdmin = await prisma.adminUser.findFirst({
    where: {
      userEmailAddress: SUPER_ADMIN_EMAIL,
    },
  });

  if (existingAdmin) {
    console.log("✅ Super admin already exists. Skipping seed.");
    return;
  }

  // Hash password using Argon2id
  const hashedPassword = await argon2.hash(SUPER_ADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  // Create Super Admin user in the AdminUser table
  await prisma.adminUser.create({
    data: {
      adminUserId: crypto.randomUUID(),
      firstName: SUPER_ADMIN_FIRSTNAME,
      lastName: SUPER_ADMIN_LASTNAME,
      password: hashedPassword,
      userEmailAddress: SUPER_ADMIN_EMAIL,
      userName: SUPER_ADMIN_USERNAME,
      userAccountStatus: "ACTIVE",
      isUserLoggedInFlag: false,
    },
  });

  console.log("✅ Super admin seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
