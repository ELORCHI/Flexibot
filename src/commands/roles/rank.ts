import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember } from "discord.js";

export const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Shows a user's rank.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to show the rank for").setRequired(false)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user") || interaction.member;

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to display the rank for.",
        ephemeral: true,
      });
      return;
    }

    // Simulate rank (can be connected to a database later)
    const rank = "Bronze";

    await interaction.reply(`${targetMember.user.tag}'s rank is ${rank}.`);
  },
};
