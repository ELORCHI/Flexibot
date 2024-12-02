import { prisma } from "./prismaClient";
import { CommandCategory } from "@prisma/client"; // Import the CommandCategory enum

/**
 * Retrieve a specific command's configuration for a guild
 * @param guildId The ID of the guild
 * @param commandName The name of the command
 * @returns The command configuration or null if not found
 */
export const getCommandConfig = async (
  guildId: string,
  commandName: string
) => {
  try {
    const command = await prisma.command.findUnique({
      where: {
        guildId_name: {
          guildId,
          name: commandName,
        },
      },
    });

    return command;
  } catch (error) {
    console.error("Error retrieving command config:", error);
    throw error;
  }
};

/**
 * Update a command's configuration
 * @param guildId The ID of the guild
 * @param commandName The name of the command
 * @param updateData Partial update for the command configuration
 * @returns The updated command
 */
export const updateCommandConfig = async (
  guildId: string,
  commandName: string,
  updateData: {
    allowedChannels?: string | null;
    ignoredChannels?: string | null;
    allowedRoles?: string | null;
    ignoredRoles?: string | null;
    enabled?: boolean;
  }
) => {
  try {
    const updatedCommand = await prisma.command.update({
      where: {
        guildId_name: {
          guildId,
          name: commandName,
        },
      },
      data: updateData,
    });

    return updatedCommand;
  } catch (error) {
    console.error("Error updating command config:", error);
    throw error;
  }
};

type GroupedCommands = {
  [category in CommandCategory]: {
    name: string;
    description: string | null;
    enabled: boolean;
    id: number;
    allowedChannels: string | null;
    allowedRoles: string | null;
    ignoredChannels: string | null;
    ignoredRoles: string | null;
  }[];
};

export async function getGuildCommandsByCategory(
  guildId: string
): Promise<GroupedCommands> {
  // Fetch all commands for the specific guild
  const commands = await prisma.command.findMany({
    where: {
      guildId: guildId,
    },
    select: {
      name: true,
      category: true,
      description: true,
      enabled: true,
      id: true,
      allowedChannels: true,
      allowedRoles: true,
      ignoredChannels: true,
      ignoredRoles: true,
    },
    orderBy: {
      name: "asc", // Optional: sort commands alphabetically within each category
    },
  });

  // Group commands by category
  return commands.reduce((grouped, command) => {
    // Ensure the category array exists
    if (!grouped[command.category]) {
      grouped[command.category] = [];
    }

    // Add the command to its category
    grouped[command.category].push({
      name: command.name,
      description: command.description,
      enabled: command.enabled,
      id: command.id,
      allowedChannels: command.allowedChannels,
      allowedRoles: command.allowedRoles,
      ignoredChannels: command.ignoredChannels,
      ignoredRoles: command.ignoredRoles,
    });

    return grouped;
  }, {} as GroupedCommands);
}
