import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { prisma } from "../../db/prismaClient"; // Adjust the import path as needed

export const clearwarn: Command = {
  data: new SlashCommandBuilder()
    .setName("clearwarn")
    .setDescription("Clear all warnings for a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to clear warnings for")
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
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to clear warnings for or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Use a transaction to ensure atomic operations
      const result = await prisma.$transaction(async (prisma) => {
        // Count existing warnings before deletion
        const warningCount = await prisma.warning.count({
          where: {
            guildId: interaction.guild!.id,
            userId: targetMember.id,
          },
        });

        // Delete all warnings for the user in this guild
        const deletedWarnings = await prisma.warning.deleteMany({
          where: {
            guildId: interaction.guild!.id,
            userId: targetMember.id,
          },
        });

        // Create a moderation log entry for the warning clearance
        const moderationLog = await prisma.moderationLog.create({
          data: {
            guildId: interaction.guild!.id,
            action: "clear_warnings",
            targetId: targetMember.id,
            moderatorId: interaction.user.id,
            reason: "Cleared all warnings",
          },
        });

        return { warningCount, deletedWarnings, moderationLog };
      });

      // Construct response message
      const responseMessage =
        result.warningCount > 0
          ? `Cleared ${result.warningCount} warning(s) for ${targetMember.user.tag}.`
          : `${targetMember.user.tag} had no warnings to clear.`;

      // Reply to the interaction
      await interaction.reply({
        content: responseMessage,
        ephemeral: false,
      });

      // Optionally, send a DM to the user
      try {
        await targetMember.send({
          content: `All your warnings in ${
            interaction.guild!.name
          } have been cleared by a moderator.`,
        });
      } catch (dmError) {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }
    } catch (error) {
      console.error("Error clearing warnings:", error);
      await interaction.reply({
        content: "There was an error clearing the warnings.",
        ephemeral: true,
      });
    }
  },
};
