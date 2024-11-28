import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to kick").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) as SlashCommandBuilder,

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

    // Check if the bot has the required permission to kick members
    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({
        content: "I don't have permission to kick members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the member is kickable (not higher role or not the bot itself)
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
