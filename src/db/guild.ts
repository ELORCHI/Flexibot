import { prisma } from "./prismaClient";
import { CommandCategory } from "@prisma/client";
// Function to get a guild by ID
export const getGuildById = async (guildId: string) => {
  try {
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });
    return guild;
  } catch (error) {
    console.error("Error fetching guild by ID:", error);
    throw error;
  }
};

export const createGuild = async (data: {
  id: string; // Discord guild ID
  name: string;
  icon?: string;
  addedById?: string; // Optional field
}) => {
  try {
    const guild = await prisma.guild.upsert({
      where: { id: data.id },
      update: { ...data },
      create: { ...data },
    });
    return guild;
  } catch (error) {
    console.error("Error upserting guild:", error);
    throw error;
  }
};

// Function to update an existing guild
export const updateGuild = async (
  guildId: string,
  data: {
    name?: string;
    icon?: string;
  }
) => {
  try {
    const guild = await prisma.guild.update({
      where: { id: guildId },
      data,
    });
    return guild;
  } catch (error) {
    console.error("Error updating guild:", error);
    throw error;
  }
};

// Function to delete a guild by ID
export const deleteGuild = async (guildId: string) => {
  try {
    const g = await prisma.guild.findUnique({
      where: { id: guildId },
    });
    if (g) {
      const deletedGuild = await prisma.guild.delete({
        where: { id: guildId },
      });
      return deletedGuild;
    }
  } catch (error) {
    console.error("Error deleting guild:", error);
  }
};

// Update your command categories to match the enum
const commandCategories = {
  INFO: ["ping", "serverinfo", "userinfo"],
  MODERATION: [
    "clearwarn",
    "delwarn",
    "lock",
    "mute",
    "undeafen",
    "warn",
    "deafen",
    "kick",
    "modlogs",
    "softban",
    "unlock",
  ],
  ROLES: [
    "addrank",
    "addRole",
    "delrank",
    "ranks",
    "rank",
    "roleInfo",
    "roles",
  ],
  UTILS: ["clean", "clear", "delslmode", "remind", "setnick", "slowmode"],
};

// Alternatively, you can use a type assertion with more safety
export const createGuildWithDefaultCommands = async (guildData: {
  id: string;
  name: string;
  icon?: string;
  addedById?: string;
}) => {
  try {
    // Create the guild first
    const guild = await createGuild(guildData);

    // Create default commands for the guild
    const commandPromises = Object.entries(commandCategories).flatMap(
      ([category, commands]) =>
        commands.map((commandName) =>
          prisma.command.create({
            data: {
              guildId: guild.id,
              name: commandName,
              category: category as keyof typeof CommandCategory, // Use keyof typeof for type safety
              description: getCommandDescription(commandName),
            },
          })
        )
    );

    // Execute all command creation promises
    const createdCommands = await Promise.all(commandPromises);

    // Return the guild with its created commands
    console.log({ guild, createdCommands });
    return {
      guild,
      commands: createdCommands,
    };
  } catch (error) {
    console.error("Error creating guild with default commands:", error);
    throw error;
  }
};

// Helper function to get command descriptions
function getCommandDescription(commandName: string): string {
  // You can expand this with more detailed descriptions
  const descriptions: Record<string, string> = {
    // INFO category
    ping: "Check the bot's latency",
    serverinfo: "Get information about the server",
    userinfo: "Get information about a user",

    // MODERATION category
    clearwarn: "Clear warnings for a user",
    delwarn: "Delete a specific warning",
    lock: "Lock a channel",
    mute: "Mute a user",
    undeafen: "Undeafen a user",
    warn: "Warn a user",
    deafen: "Deafen a user",
    kick: "Kick a user from the server",
    modlogs: "View moderation logs",
    softban: "Soft ban a user",
    unlock: "Unlock a channel",

    // ROLES category
    addrank: "Add a new rank",
    addRole: "Add a role to a user",
    delrank: "Delete a rank",
    ranks: "List available ranks",
    rank: "Check a user's rank",
    roleInfo: "Get information about a role",
    roles: "List server roles",

    // UTILITY category
    clean: "Clean messages in a channel",
    clear: "Clear messages in a channel",
    delslmode: "Delete slowmode setting",
    remind: "Set a reminder",
    setnick: "Set a user's nickname",
    slowmode: "Set slowmode for a channel",
  };

  return descriptions[commandName] || "No description available";
}

export const deleteGuildWithAllRelatedRecords = async (guildId: string) => {
  try {
    // Use a transaction to ensure all deletions happen atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Delete related records first (in order of dependencies)
      await prisma.pollOption.deleteMany({
        where: { poll: { guildId } },
      });

      await prisma.poll.deleteMany({
        where: { guildId },
      });

      await prisma.rank.deleteMany({
        where: { guildId },
      });

      await prisma.warning.deleteMany({
        where: { guildId },
      });

      await prisma.moderationLog.deleteMany({
        where: { guildId },
      });

      await prisma.command.deleteMany({
        where: { guildId },
      });

      // Finally, delete the guild itself
      const deletedGuild = await prisma.guild.delete({
        where: { id: guildId },
      });

      return deletedGuild;
    });

    return result;
  } catch (error) {
    console.error("Error deleting guild and related records:", error);
    // throw error;
  }
};
