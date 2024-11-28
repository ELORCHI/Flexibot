import { Command } from "../../types/command";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const addrank: Command = {
  data: new SlashCommandBuilder()
    .setName("addrank")
    .setDescription("Add a new rank to the server.")
    .addStringOption((option) =>
      option.setName("rank")
        .setDescription("The name of the rank to add")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles) as SlashCommandBuilder,
  
  execute: async (interaction) => {
    const rankName = interaction.options.getString("rank");
    if (!rankName) {
      await interaction.reply({
        content: "Please provide a rank name.",
        ephemeral: true,
      });
      return;
    }
    // Simulate adding rank (replace with actual database interaction)
    console.log(`Rank "${rankName}" has been added.`);
    await interaction.reply(`The rank "${rankName}" has been added to the server.`);
  },
};