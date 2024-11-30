import { prisma } from "../../db/prismaClient"; // Adjust the import path as needed
import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";

export const warn: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member in the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    // Or type guard approach
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

    // Validate target member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to warn or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Ensure moderator can't warn themselves
    if (targetMember.id === interaction.user.id) {
      await interaction.reply({
        content: "You cannot warn yourself.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Use a transaction to ensure both warning and moderation log are created
      const result = await prisma.$transaction(async (prisma) => {
        // Create warning in the database
        const warning = await prisma.warning.create({
          data: {
            guildId: interaction.guild!.id, // Non-null assertion
            userId: targetMember.id,
            moderatorId: interaction.user.id,
            reason: reason,
          },
        });

        // Create moderation log entry
        const moderationLog = await prisma.moderationLog.create({
          data: {
            guildId: interaction.guild!.id, // Non-null assertion
            action: "warn",
            targetId: targetMember.id,
            moderatorId: interaction.user.id,
            userId: targetMember.id,
            reason: reason,
          },
        });

        // Get total warnings for the user in this guild
        const totalWarnings = await prisma.warning.count({
          where: {
            guildId: interaction.guild!.id, // Non-null assertion
            userId: targetMember.id,
          },
        });

        return { warning, moderationLog, totalWarnings };
      });

      // Construct warning message
      const warningMessage = `${targetMember.user.tag} has been warned. 
Reason: ${reason}
Total Warnings: ${result.totalWarnings}`;

      // Reply to the interaction
      await interaction.reply({
        content: warningMessage,
        ephemeral: false,
      });

      // Optionally, send a DM to the warned user
      try {
        await targetMember.send({
          content: `You have been warned in ${
            interaction.guild!.name
          }. Reason: ${reason}`,
        });
      } catch (dmError) {
        console.log(`Could not send DM to ${targetMember.user.tag}`);
      }
    } catch (error) {
      console.error("Error creating warning or moderation log:", error);
      await interaction.reply({
        content: "There was an error processing the warning.",
        ephemeral: true,
      });
    }
  },
};
