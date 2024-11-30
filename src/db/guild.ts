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

// Function to create a new guild
export const createGuild = async (data: {
  id: string; // Discord guild ID
  name: string;
  icon?: string;
  addedById?: string; // Make this optional by adding ?
}) => {
  try {
    const guild = await prisma.guild.create({
      data,
    });
    return guild;
  } catch (error) {
    console.error("Error creating guild:", error);
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
    const deletedGuild = await prisma.guild.delete({
      where: { id: guildId },
    });
    return deletedGuild;
  } catch (error) {
    console.error("Error deleting guild:", error);
    throw error;
  }
};
