import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { prisma } from "../../db/prismaClient";

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
        .setName("reason")
        .setDescription("Reason for muting the member")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.MuteMembers
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

    // Validate the target member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to mute or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Check bot permissions
    const botMember = interaction.guild.members.me;
    if (
      !botMember ||
      !botMember.permissions.has(PermissionFlagsBits.MuteMembers)
    ) {
      await interaction.reply({
        content: "I don't have permission to mute members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the member is already muted
    if (targetMember.voice.serverMute) {
      await interaction.reply({
        content: `${targetMember.user.tag} is already muted.`,
        ephemeral: true,
      });
      return;
    }

    try {
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
      await interaction.reply({
        content: `${targetMember.user.tag} has been muted.\nReason: ${reason}`,
        ephemeral: false,
      });

      // Optionally, notify the muted user via DM
      try {
        await targetMember.send(
          `You have been muted in ${interaction.guild.name}.\nReason: ${reason}`
        );
      } catch {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }
    } catch (error) {
      console.error("Error muting member:", error);
      await interaction.reply({
        content:
          "An error occurred while trying to mute the member. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
