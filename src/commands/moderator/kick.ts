import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { prisma } from "../../db/prismaClient"; // Adjust the path as needed

// Function to create embed messages
const createEmbed = (
  title: string,
  description: string,
  color: `#${string}` | number
) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
};

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
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    if (!interaction.guild) {
      const embed = createEmbed(
        "Invalid Usage",
        "This command can only be used in a server.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const targetMember = interaction.options.getMember("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    // Validate that the target is a guild member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      const embed = createEmbed(
        "Invalid Member",
        "Could not find the member to kick or the user is not a valid member.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check bot permissions
    if (
      !interaction.guild.members.me?.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      const embed = createEmbed(
        "Permission Denied",
        "I don't have permission to kick members.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check if the member is kickable
    if (!targetMember.kickable) {
      const embed = createEmbed(
        "Kick Failed",
        "I cannot kick this member. They may have a higher role or I lack permissions.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

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

      // Construct the success embed
      const embed = createEmbed(
        "Member Kicked",
        `${targetMember.user.tag} has been kicked from the server.\nReason: ${reason}`,
        Colors.Green
      );

      // Notify the user who executed the command
      await interaction.editReply({ embeds: [embed] });

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

      const embed = createEmbed(
        "Error",
        "An error occurred while trying to kick the member. Please try again later.",
        Colors.Red
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
