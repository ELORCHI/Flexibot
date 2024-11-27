import { PrismaClient } from "@prisma/client";

// Create an instance of PrismaClient
const prisma = new PrismaClient();

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

// Export the Prisma client for direct access if needed
export { prisma };
