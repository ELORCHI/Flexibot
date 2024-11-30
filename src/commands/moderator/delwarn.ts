import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { prisma } from "../../db/prismaClient"; // Adjust the import path as needed

export const delwarn: Command = {
  data: new SlashCommandBuilder()
    .setName("delwarn")
    .setDescription("Clear a specific warning for a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to clear a warning for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("warning_id")
        .setDescription("The ID of the warning to clear")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    // Ensure the interaction is in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const targetMember = interaction.options.getMember("user");
    const warningId = interaction.options.getString("warning_id");

    // Validate member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to clear warning for or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Validate warning ID
    if (!warningId) {
      await interaction.reply({
        content: "Please provide a valid warning ID.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Use a transaction to ensure atomic operations
      const result = await prisma.$transaction(async (prisma) => {
        // First, verify the warning exists and belongs to the user in this guild
        const existingWarning = await prisma.warning.findUnique({
          where: {
            id: warningId,
            guildId: interaction.guild!.id,
            userId: targetMember.id,
          },
        });

        // If warning doesn't exist, throw an error
        if (!existingWarning) {
          throw new Error("Warning not found or does not belong to this user.");
        }

        // Delete the specific warning
        const deletedWarning = await prisma.warning.delete({
          where: { id: warningId },
        });

        // Create a moderation log entry for the warning deletion
        const moderationLog = await prisma.moderationLog.create({
          data: {
            guildId: interaction.guild!.id,
            action: "delete_warning",
            targetId: targetMember.id,
            moderatorId: interaction.user.id,
            reason: `Deleted warning #${warningId}`,
          },
        });

        return { deletedWarning, moderationLog };
      });

      // Reply to the interaction
      await interaction.reply({
        content: `Warning #${warningId} for ${targetMember.user.tag} has been cleared.`,
        ephemeral: false,
      });

      // Optionally, send a DM to the user
      try {
        await targetMember.send({
          content: `A warning in ${
            interaction.guild!.name
          } has been removed by a moderator.`,
        });
      } catch (dmError) {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }
    } catch (error) {
      console.error("Error clearing warning:", error);

      // More specific error handling
      if (
        error instanceof Error &&
        error.message.includes("Warning not found")
      ) {
        await interaction.reply({
          content:
            "The specified warning could not be found or does not belong to this user.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "An error occurred while trying to clear the warning.",
          ephemeral: true,
        });
      }
    }
  },
};
