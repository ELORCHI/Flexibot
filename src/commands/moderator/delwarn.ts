import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  EmbedBuilder,
  Colors, // Import Colors object
} from "discord.js";
import { prisma } from "../../db/prismaClient"; // Adjust the import path as needed

// Function to create embed messages
const createEmbed = (
  title: string,
  description: string,
  color: `#${string}` | number
) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color) // Use color directly (either hex or Colors constants)
    .setTimestamp();
};

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
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    // Ensure the interaction is in a guild
    if (!interaction.guild) {
      const embed = createEmbed(
        "Invalid Usage",
        "This command can only be used in a server.",
        Colors.Red // Use Colors.Red here directly
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const targetMember = interaction.options.getMember("user");
    const warningId = interaction.options.getString("warning_id");

    // Validate member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      const embed = createEmbed(
        "Invalid Member",
        "Could not find the member to clear the warning for or the user is not a valid member.",
        Colors.Red // Use Colors.Red here directly
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Validate warning ID
    if (!warningId) {
      const embed = createEmbed(
        "Invalid Warning ID",
        "Please provide a valid warning ID.",
        Colors.Red // Use Colors.Red here directly
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    // Defer the reply so we can later edit the message
    await interaction.deferReply({ ephemeral: true });
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

      const embed = createEmbed(
        "Warning Cleared",
        `Warning #${warningId} for ${targetMember.user.tag} has been cleared.`,
        Colors.Green // Use Colors.Green here directly
      );

      // Edit the deferred reply with the success message
      await interaction.editReply({ embeds: [embed] });

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

      let embed;
      // More specific error handling
      if (
        error instanceof Error &&
        error.message.includes("Warning not found")
      ) {
        embed = createEmbed(
          "Warning Not Found",
          "The specified warning could not be found or does not belong to this user.",
          Colors.Red // Use Colors.Red here directly
        );
      } else {
        embed = createEmbed(
          "Error",
          "An error occurred while trying to clear the warning.",
          Colors.Red // Use Colors.Red here directly
        );
      }

      // Edit the deferred reply with the error message
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
