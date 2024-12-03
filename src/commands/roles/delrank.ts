import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "../../db/prismaClient";
import { Command } from "../../types/command";
import { generateEmbed } from "../../utils/generateEmbed";

export const delRankCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("delrank")
    .setDescription("Deletes a rank from the system")
    .addStringOption((option) =>
      option
        .setName("rankname")
        .setDescription("The name of the rank to delete")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    const rankName = interaction.options.getString("rankname", true);
    const guildId = interaction.guildId;

    if (!guildId) {
      const embed = generateEmbed(
        "Error",
        "This command can only be used in a server.",
        "Red",
        interaction.user
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      // Fetch the rank from the database using rankName and guildId
      const rank = await prisma.rank.findFirst({
        where: { rankName, guildId },
      });

      if (!rank) {
        const embed = generateEmbed(
          "Rank Not Found",
          `The rank **"${rankName}"** was not found in this guild.`,
          "Red",
          interaction.user
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Delete the rank from the database
      await prisma.rank.delete({
        where: { id: rank.id },
      });

      const embed = generateEmbed(
        "Rank Deleted",
        `The rank **"${rankName}"** has been successfully deleted from the system.`,
        "Green",
        interaction.user
      );
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = generateEmbed(
        "Error",
        "An error occurred while trying to delete the rank. Please try again later.",
        "Red",
        interaction.user
      );
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
