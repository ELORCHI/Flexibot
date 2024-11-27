import { PrismaClient } from "@prisma/client";

// Create an instance of PrismaClient
const prisma = new PrismaClient();

// Export the Prisma client for direct access if needed
export { prisma };
