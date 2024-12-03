import { prisma } from "../../db/prismaClient"; // Adjust the import path as needed
import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  EmbedBuilder,
  Colors,
  ChatInputCommandInteraction,
} from "discord.js";

// Function to create embed messages
const createEmbed = (
  title: string,
  description: string,
  color: `#${string}` | number,
  warningId: string = "" // Optionally add warningId to the embed message
) => {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  if (warningId) {
    embed.addFields({ name: "Warning ID", value: warningId });
  }

  return embed;
};

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
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    // Or type guard approach
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

    // Validate target member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      const embed = createEmbed(
        "Invalid Member",
        "Could not find the member to warn or the user is not a valid member.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Ensure moderator can't warn themselves
    if (targetMember.id === interaction.user.id) {
      const embed = createEmbed(
        "Self Warning Error",
        "You cannot warn yourself.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

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
      const embed = createEmbed(
        "Warning Issued",
        `**${targetMember.user.tag}** has been warned.\nReason: ${reason}\nTotal Warnings: ${result.totalWarnings}`,
        Colors.Yellow,
        result.warning.id // Add the warning ID to the embed
      );

      // Reply to the interaction
      await interaction.editReply({ embeds: [embed] });

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

      const embed = createEmbed(
        "Error",
        "There was an error processing the warning. Please try again later.",
        Colors.Red
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
