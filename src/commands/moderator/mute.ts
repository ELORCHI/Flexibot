import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";
import { prisma } from "../../db/prismaClient";
import { Command } from "../../types/command";
import { generateEmbed } from "../../utils/generateEmbed"; // Utility for creating consistent embeds

// Utility function to parse duration
function parseDuration(duration: string): number {
  const units: { [key: string]: number } = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  };

  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid duration format. Use format like 1h, 30m, 7d");
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  // Enforce maximum duration of 28 days
  const maxDuration = 28 * 24 * 60 * 60 * 1000;
  const calculatedDuration = value * units[unit];

  return Math.min(calculatedDuration, maxDuration);
}

export const mute: Command = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member in the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the mute (e.g., 1h, 30m)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for muting the member")
        .setRequired(false)
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
    const duration = interaction.options.getString("duration");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    // Validate the target member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      const embed = generateEmbed(
        "Error",
        "Could not find the member to mute or the user is not a valid member.",
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check if the member is in a voice channel
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
        "I don't have permission to mute members.",
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Check if the member is already muted
    if (targetMember.voice.serverMute) {
      const embed = generateEmbed(
        "Info",
        `${targetMember.user.tag} is already muted.`,
        "Yellow",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply();

      // Mute the member
      await targetMember.voice.setMute(true, reason);

      // Log the action in the database
      await prisma.moderationLog.create({
        data: {
          guildId: interaction.guild.id,
          action: "mute",
          targetId: targetMember.id,
          moderatorId: interaction.user.id,
          reason,
        },
      });

      // Notify the moderator of the successful mute
      const muteEmbed = generateEmbed(
        "Mute Successful",
        `${targetMember.user.tag} has been muted.\nReason: ${reason}${
          duration ? `\nDuration: ${duration}` : ""
        }`,
        "Green",
        interaction.user
      );
      await interaction.editReply({ embeds: [muteEmbed] });

      // Optionally, notify the muted user via DM
      try {
        const dmEmbed = generateEmbed(
          "You Have Been Muted",
          `You have been muted in **${
            interaction.guild.name
          }**.\nReason: ${reason}${duration ? `\nDuration: ${duration}` : ""}`,
          "Orange",
          interaction.user
        );
        await targetMember.send({ embeds: [dmEmbed] });
      } catch {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }

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

      // Now interaction.guild is guaranteed to be non-null.
      const guildId = interaction.guild.id;
      // Handle timed mute
      if (duration) {
        try {
          const durationMs = parseDuration(duration);

          setTimeout(async () => {
            try {
              // Unmute the member after the duration
              await targetMember.voice.setMute(false);

              // Notify the user and optionally log it
              const unmuteEmbed = generateEmbed(
                "Unmute Notification",
                `${targetMember.user.tag} has been automatically unmuted after ${duration}.`,
                "Green",
                interaction.user
              );
              await interaction.followUp({ embeds: [unmuteEmbed] });

              await prisma.moderationLog.create({
                data: {
                  guildId: guildId,
                  action: "unmute",
                  targetId: targetMember.id,
                  moderatorId: interaction.user.id,
                  reason: "Automatic unmute after mute duration expired",
                },
              });
            } catch (error) {
              console.error(
                `Error automatically unmuting ${targetMember.user.tag}:`,
                error
              );
            }
          }, durationMs);
        } catch (error) {
          const embed = generateEmbed(
            "Error",
            "Invalid duration format. The member was muted indefinitely.",
            "Red",
            interaction.user
          );
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (error) {
      console.error("Error muting member:", error);
      const embed = generateEmbed(
        "Error",
        "An error occurred while trying to mute the member. Please try again later.",
        "Red",
        interaction.user
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
