import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { prisma } from "../../db/prismaClient"; // Adjust the path as needed

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kicking the member")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const targetMember = interaction.options.getMember("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    // Validate that the target is a guild member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to kick or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Check bot permissions
    if (
      !interaction.guild.members.me?.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      await interaction.reply({
        content: "I don't have permission to kick members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the member is kickable
    if (!targetMember.kickable) {
      await interaction.reply({
        content:
          "I cannot kick this member. They may have a higher role or I lack permissions.",
        ephemeral: true,
      });
      return;
    }
    try {
      // Perform the kick
      await targetMember.kick(reason);

      // Log the action to the database
      await prisma.moderationLog.create({
        data: {
          guildId: interaction.guild.id,
          action: "kick",
          targetId: targetMember.id,
          moderatorId: interaction.user.id,
          reason,
        },
      });

      // Notify the user who executed the command
      await interaction.reply({
        content: `${targetMember.user.tag} has been kicked from the server.\nReason: ${reason}`,
        ephemeral: false,
      });

      // Optionally, DM the kicked member
      try {
        await targetMember.send(
          `You have been kicked from ${interaction.guild.name}.\nReason: ${reason}`
        );
      } catch {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }
    } catch (error) {
      console.error("Error kicking member:", error);
      await interaction.reply({
        content:
          "An error occurred while trying to kick the member. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
