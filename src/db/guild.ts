import { prisma } from "./prismaClient";
import { CommandCategory } from "@prisma/client";
import { commandCategories } from "./commandbyCategories";
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

    // Prepare commands data for batch creation
    const commandsData = Object.entries(commandCategories).flatMap(
      ([category, commands]) =>
        commands.map((commandInfo) => ({
          guildId: guild.id,
          name: commandInfo.name,
          category: category as keyof typeof CommandCategory, // Type safety
          description: commandInfo.description,
          usage: commandInfo.usage,
          example: commandInfo.example,
          requiredpermissions: commandInfo.requiredpermissions,
        }))
    );

    // Use createMany for batch insertion of commands
    await prisma.command.createMany({
      data: commandsData,
      skipDuplicates: true, // Optional: Avoid inserting duplicates if needed
    });

    // Return the guild with the number of created commands
    console.log({ guild, commandsCreated: commandsData.length });
    return {
      guild,
      commands: commandsData,
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
