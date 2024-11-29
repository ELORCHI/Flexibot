import { Command } from "../../types/command"; // Adjust the import path to match your project structure
import { SlashCommandBuilder } from "discord.js";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with 'Pong!'"),

  execute: async (interaction) => {
    await interaction.reply("Pong!");
  },
};
