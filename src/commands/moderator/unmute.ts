import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";
import { prisma } from "../../db/prismaClient";
import { Command } from "../../types/command";
import { generateEmbed } from "../../utils/generateEmbed"; // Utility function for creating consistent embeds

export const unmute: Command = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a member in the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to unmute")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) {
      const embed = generateEmbed(
        "Error",
        "This command can only be used in a server.",
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const targetMember = interaction.options.getMember("user");

    // Validate the target member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      const embed = generateEmbed(
        "Error",
        "Could not find the member to unmute or the user is not a valid member.",
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check if the target member is in a voice channel
    if (!targetMember.voice.channel) {
      const embed = generateEmbed(
        "Error",
        `${targetMember.user.tag} is not in a voice channel.`,
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check bot permissions
    const botMember = interaction.guild.members.me;
    if (
      !botMember ||
      !botMember.permissions.has(PermissionFlagsBits.MuteMembers)
    ) {
      const embed = generateEmbed(
        "Error",
        "I don't have permission to unmute members.",
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check if the member is already unmuted
    if (!targetMember.voice.serverMute) {
      const embed = generateEmbed(
        "Info",
        `${targetMember.user.tag} is not muted.`,
        "Yellow",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply({ ephemeral: false });

      // Unmute the member
      await targetMember.voice.setMute(false);

      // Log the action in the database
      await prisma.moderationLog.create({
        data: {
          guildId: interaction.guild.id,
          action: "unmute",
          targetId: targetMember.id,
          moderatorId: interaction.user.id,
          reason: "Unmuted by moderator",
        },
      });

      // Notify the moderator of the successful unmute
      const embed = generateEmbed(
        "Unmute Successful",
        `${targetMember.user.tag} has been unmuted.`,
        "Green",
        interaction.user
      );
      await interaction.editReply({ embeds: [embed] });

      // Optionally, notify the unmuted user via DM
      try {
        const dmEmbed = generateEmbed(
          "You Have Been Unmuted",
          `You have been unmuted in **${interaction.guild.name}**.`,
          "Green",
          interaction.user
        );
        await targetMember.send({ embeds: [dmEmbed] });
      } catch {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }
    } catch (error) {
      console.error("Error unmuting member:", error);
      const embed = generateEmbed(
        "Error",
        "An error occurred while trying to unmute the member. Please try again later.",
        "Red",
        interaction.user
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
