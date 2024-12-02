import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
} from "discord.js";
import { prisma } from "../../db/prismaClient";
import { Command } from "../../types/command";

export const delRankCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("delrank")
    .setDescription("Deletes a rank from a user and the system")
    .addStringOption((option) =>
      option
        .setName("rankname")
        .setDescription("The name of the rank to delete")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("guildid")
        .setDescription("The guild where the rank exists")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    const rankName = interaction.options.getString("rankname");
    const guildId = interaction.options.getString("guildid");

    if (!rankName || !guildId) {
      await interaction.reply({
        content: "Rank name or guild ID not provided.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Fetch the rank from the database using rankName and guildId as the filter
      const rank = await prisma.rank.findFirst({
        where: { rankName, guildId }, // Corrected query to use where with rankName and guildId
        include: { UserRank: true }, // Include the UserRank relation
      });

      if (!rank) {
        await interaction.reply({
          content: `Rank "${rankName}" not found in the specified guild.`,
          ephemeral: true,
        });
        return;
      }

      // Step 1: Unlink all users from this rank (delete from UserRank table)
      for (const userRank of rank.UserRank) {
        await prisma.userRank.delete({
          where: { id: userRank.id },
        });
      }

      // Step 2: Optionally, remove the rank from the users in Discord
      const discordRole = interaction.guild?.roles.cache.find(
        (r) => r.name === rank.roleName
      );
      if (discordRole) {
        const membersWithRole = interaction.guild?.members.cache.filter(
          (member) => member.roles.cache.has(discordRole.id)
        );
        if (membersWithRole) {
          for (const member of membersWithRole.values()) {
            await member.roles.remove(discordRole); // Remove the role from each member
          }
        }
      }

      // Step 3: Delete the rank from the database
      await prisma.rank.delete({
        where: { id: rank.id }, // Delete by rank ID
      });

      await interaction.reply({
        content: `Successfully deleted the "${rankName}" rank from the system.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error deleting the rank.",
        ephemeral: true,
      });
    }
  },
};
