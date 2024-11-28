import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember } from "discord.js";

export const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Display the rank of a member.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to check rank for").setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Simulate getting rank. Replace with database integration later.
    const rank = "Silver"; // Example rank. You can replace this with actual database logic.

    await interaction.reply(`${targetMember.user.tag}'s rank is: ${rank}`);
  },
};
