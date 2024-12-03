import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, EmbedBuilder } from "discord.js";
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
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to clear warnings for or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const result = await prisma.$transaction(async (prisma) => {
        const warningCount = await prisma.warning.count({
          where: {
            guildId: interaction.guild!.id,
            userId: targetMember.id,
          },
        });

        const deletedWarnings = await prisma.warning.deleteMany({
          where: {
            guildId: interaction.guild!.id,
            userId: targetMember.id,
          },
        });

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
      console.log({ result });
      const embed = new EmbedBuilder()
        .setTitle("Warnings Cleared")
        .setColor("Green")
        .addFields(
          { name: "Member", value: `${targetMember.user.tag}`, inline: true },
          {
            name: "Warnings Cleared",
            value: result.warningCount.toString(),
            inline: true,
          },
          {
            name: "Moderator",
            value: interaction.user.tag,
            inline: true,
          }
        )
        .setFooter({
          text: `Guild: ${interaction.guild.name}`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

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
      await interaction.editReply({
        content: "There was an error clearing the warnings.",
      });
    }
  },
};
