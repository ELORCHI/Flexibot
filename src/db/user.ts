import { prisma } from "./prismaClient";

// Function to get a user by ID
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

// Function to create a new user
export const createUser = async (data: {
  id: string; // Discord user ID
  username: string;
  avatar?: string;
  email?: string;
}) => {
  try {
    const user = await prisma.user.create({
      data,
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Function to update an existing user
export const updateUser = async (
  id: string,
  data: {
    username?: string;
    avatar?: string;
    email?: string;
  }
) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Function to delete a user by ID
export const deleteUser = async (id: string) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export async function saveUserAndGuilds(user: any, guilds: any[]) {
  try {
    // Upsert user (create or update if exists)
    const savedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      },
      create: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      },
    });

    // Save or update guilds the user is in
    const guildUpsertPromises = guilds.map(async (guild: any) => {
      return prisma.guild.upsert({
        where: { id: guild.id },
        update: {
          name: guild.name,
          icon: guild.icon,
        },
        create: {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          addedById: user.id,
        },
      });
    });

    // Wait for all guild upserts to complete
    await Promise.all(guildUpsertPromises);

    return savedUser;
  } catch (error) {
    console.error("Error saving user and guilds:", error);
    throw error;
  }
}
