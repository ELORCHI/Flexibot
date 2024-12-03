import { prisma } from "./prismaClient";

// Function to create a warning
export const createWarning = async (data: {
  guildId: string;
  userId: string;
  moderatorId: string;
  reason?: string; // Optional in function
}) => {
  try {
    const warning = await prisma.warning.create({
      data: {
        guildId: data.guildId,
        userId: data.userId,
        moderatorId: data.moderatorId,
        reason: data.reason || "No reason provided", // Ensure reason is a string
      },
    });
    return warning;
  } catch (error) {
    console.error("Error creating warning:", error);
    throw error;
  }
};

// Function to get moderation logs for a guild
export const getModerationLogs = async (guildId: string) => {
  try {
    const logs = await prisma.moderationLog.findMany({
      where: { guildId },
    });
    return logs;
  } catch (error) {
    console.error("Error fetching moderation logs:", error);
    throw error;
  }
};

// Function to create a moderation log
export const createModerationLog = async (data: {
  guildId: string;
  userId: string;
  action: string;
  reason?: string;
  targetId: string; // Add these fields
  moderatorId: string;
}) => {
  try {
    const log = await prisma.moderationLog.create({
      data: {
        guildId: data.guildId,
        action: data.action,
        reason: data.reason || "No reason provided",
        targetId: data.targetId, // Pass these fields to Prisma
        moderatorId: data.moderatorId,
      },
    });
    return log;
  } catch (error) {
    console.error("Error creating moderation log:", error);
    throw error;
  }
};
