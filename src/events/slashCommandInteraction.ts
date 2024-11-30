import { Interaction, ChatInputCommandInteraction } from "discord.js";
import ClientWithCommands from "../types/discord";
import { Command } from "../types/command";
import { PrismaClient } from "@prisma/client";
import { checkCommandPermissions } from "../utils/CheckCommand";

const prisma = new PrismaClient();

export default {
  name: "interactionCreate",
  async execute(interaction: Interaction, client: ClientWithCommands) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(
      interaction.commandName
    ) as unknown as Command;
    if (!command) {
      return await interaction.reply({
        content: "Command not fount",
        ephemeral: true,
      });
    }
    console.log({ interaction });
    try {
      // Check command permissions
      const permissionCheck = await checkCommandPermissions(
        interaction as ChatInputCommandInteraction,
        prisma
      );

      if (!permissionCheck.allowed) {
        return await interaction.reply({
          content:
            permissionCheck.reason ||
            "You are not allowed to use this command.",
          ephemeral: true,
        });
      }

      // Execute the command if permissions check passes
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
