import { prisma } from "./prismaClient";

export const createGuildWithCommands = async (
  guildData: {
    id: string;
    name: string;
    addedById: string;
    icon?: string;
    enabled?: boolean;
  },
  commands: Array<{
    name: string;
    allowedChannels?: string;
    ignoredChannels?: string;
    allowedRoles?: string;
    ignoredRoles?: string;
  }>
) => {
  try {
    const guild = await prisma.guild.create({
      data: {
        ...guildData,
        commands: {
          create: commands,
        },
      },
      include: {
        commands: true,
      },
    });

    return guild;
  } catch (error) {
    console.error("Error creating guild with commands:", error);
    throw error;
  }
};

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
