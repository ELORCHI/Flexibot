import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { prisma } from "../../db/prismaClient";
import { Command } from "../../types/command";

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
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Fetch the rank from the database using rankName and guildId
      const rank = await prisma.rank.findFirst({
        where: { rankName, guildId },
      });

      if (!rank) {
        await interaction.reply({
          content: `Rank "${rankName}" not found in this guild.`,
          ephemeral: true,
        });
        return;
      }

      // Optionally, remove the role from users in Discord
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

      // Delete the rank from the database
      await prisma.rank.delete({
        where: { id: rank.id },
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
