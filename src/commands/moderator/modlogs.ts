import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember } from "discord.js";
import { prisma } from "../../db/prismaClient"; // Adjust the import path as necessary

export const modlogs: Command = {
  data: new SlashCommandBuilder()
    .setName("modlogs")
    .setDescription("Get a list of moderation logs for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to fetch moderation logs for")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    // Ensure this command is used in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const targetMember = interaction.options.getMember("user");

    // Validate the target user
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the specified user.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Fetch moderation logs from the database
      const logs = await prisma.moderationLog.findMany({
        where: {
          guildId: interaction.guild.id,
          targetId: targetMember.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Check if logs exist
      if (!logs.length) {
        await interaction.reply({
          content: `No moderation logs found for ${targetMember.user.tag}.`,
          ephemeral: true,
        });
        return;
      }

      // Format the logs for display
      const logMessage = logs
        .map(
          (log, index) =>
            `${index + 1}. **Action:** ${log.action}\n   **Reason:** ${
              log.reason || "No reason provided"
            }\n   **By:** <@${log.moderatorId}>\n   **Date:** ${new Date(
              log.createdAt
            ).toLocaleString()}`
        )
        .join("\n\n");

      // Send the logs
      await interaction.reply({
        content: `Moderation Logs for ${targetMember.user.tag}:\n\n${logMessage}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error fetching moderation logs:", error);
      await interaction.reply({
        content: "An error occurred while trying to fetch moderation logs.",
        ephemeral: true,
      });
    }
  },
};
