import { prisma } from "./prismaClient";

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

const defaultCommands = [
  "ping",
  "serverinfo",
  "userinfo",
  "clearwarn",
  "deafen",
  "delwarn",
  "kick",
  "lock",
  "modlogs",
  "mute",
  "softban",
  "undeafen",
  "unlock",
  "warn",
  "addrank",
  "ranks",
  "rank",
  "roles",
  "clean",
  "clear",
  "delslmode",
  "remind",
  "setnick",
  "slowmode",
];

// Function to create a guild and its default commands
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
    const commandPromises = defaultCommands.map((commandName) =>
      prisma.command.create({
        data: {
          guildId: guild.id,
          name: commandName,
          // Other fields will use default values as specified in the schema
        },
      })
    );

    // Execute all command creation promises
    const createdCommands = await Promise.all(commandPromises);

    // Return the guild with its created commands\
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
