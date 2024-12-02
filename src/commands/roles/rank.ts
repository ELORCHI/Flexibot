import { Command } from "../../types/command";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Join or leave a rank.")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Choose to join or leave a rank")
        .setRequired(true)
        .addChoices(
          { name: "Join", value: "join" },
          { name: "Leave", value: "leave" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("rank_name")
        .setDescription("The name of the rank")
        .setRequired(true)
    ) as SlashCommandBuilder,
  async execute(interaction) {
    const action = interaction.options.getString("action", true);
    const rankName = interaction.options.getString("rank_name", true);
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    if (!guildId) {
      const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("This command can only be used in a server.")
        .setColor("Red");
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const rank = await prisma.rank.findFirst({
      where: { guildId, rankName },
    });

    if (!rank) {
      const embed = new EmbedBuilder()
        .setTitle("Rank Not Found")
        .setDescription(`The rank **${rankName}** does not exist.`)
        .setColor("Red");
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (action === "join") {
      if (rank.userIds.includes(userId)) {
        const embed = new EmbedBuilder()
          .setTitle("Already Joined")
          .setDescription(`You are already part of the rank **${rankName}**.`)
          .setColor("Yellow");
        await interaction.reply({ embeds: [embed] });
        return;
      }

      await prisma.rank.update({
        where: { id: rank.id },
        data: {
          userIds: {
            push: userId,
          },
        },
      });

      const embed = new EmbedBuilder()
        .setTitle("Rank Joined")
        .setDescription(
          `You have successfully joined the rank **${rankName}**.`
        )
        .setColor("Green");
      await interaction.reply({ embeds: [embed] });
    } else if (action === "leave") {
      if (!rank.userIds.includes(userId)) {
        const embed = new EmbedBuilder()
          .setTitle("Not Part of Rank")
          .setDescription(`You are not part of the rank **${rankName}**.`)
          .setColor("Yellow");
        await interaction.reply({ embeds: [embed] });
        return;
      }

      await prisma.rank.update({
        where: { id: rank.id },
        data: {
          userIds: {
            set: rank.userIds.filter((id) => id !== userId),
          },
        },
      });

      const embed = new EmbedBuilder()
        .setTitle("Rank Left")
        .setDescription(`You have successfully left the rank **${rankName}**.`)
        .setColor("Green");
      await interaction.reply({ embeds: [embed] });
    }
  },
};
