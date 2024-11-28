import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember } from "discord.js";

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to kick").setRequired(true)
    ) as SlashCommandBuilder, // Type assertion here to ensure compatibility with Command type

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    // Validate that the member exists and is a GuildMember
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to kick or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    if (!targetMember.kickable) {
      await interaction.reply({
        content: "I cannot kick this member. They may have a higher role or I lack permissions.",
        ephemeral: true,
      });
      return;
    }

    // Perform the kick and confirm the action
    await targetMember.kick();
    await interaction.reply(`${targetMember.user.tag} has been kicked from the server.`);
  },
};
