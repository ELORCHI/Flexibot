import { prisma } from "./db";

// Function to get command status by guild and command name
export const getCommandStatus = async (guildId: string, command: string) => {
  try {
    const commandStatus = await prisma.commandStatus.findFirst({
      where: { guildId, command },
    });
    return commandStatus;
  } catch (error) {
    console.error("Error fetching command status:", error);
    throw error;
  }
};

// Function to create or update command status for a guild/channel
export const setCommandStatus = async (guildId: string, command: string, enabled: boolean, channelId?: string) => {
  try {
    const commandStatus = await prisma.commandStatus.upsert({
      where: {
        guildId_channelId_command: {
          guildId,
          command,
          channelId: channelId ?? "",
        },
      },
      create: {
        guildId,
        command,
        enabled,
        channelId: channelId ?? undefined,
      },
      update: {
        enabled,
      },
    });
    return commandStatus;
  } catch (error) {
    console.error("Error setting command status:", error);
    throw error;
  }
};

// Function to delete a command status by guild and command name
export const deleteCommandStatus = async (guildId: string, command: string, channelId?: string) => {
  try {
    const deletedCommandStatus = await prisma.commandStatus.delete({
      where: {
        guildId_channelId_command: {
          guildId,
          command,
          channelId: channelId ?? "",
        },
      },
    });
    return deletedCommandStatus;
  } catch (error) {
    console.error("Error deleting command status:", error);
    throw error;
  }
};
