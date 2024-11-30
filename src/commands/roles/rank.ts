import { Command } from "../../types/command";
import { SlashCommandBuilder } from "discord.js";
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
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const rank = await prisma.rank.findFirst({
      where: { guildId, rankName },
    });

    if (!rank) {
      await interaction.reply(`The rank **${rankName}** does not exist.`);
      return;
    }

    if (action === "join") {
      const existing = await prisma.userRank.findFirst({
        where: { userId, rankId: rank.id },
      });

      if (existing) {
        await interaction.reply(
          `You are already part of the rank **${rankName}**.`
        );
        return;
      }

      await prisma.userRank.create({
        data: { userId, rankId: rank.id },
      });

      await interaction.reply(`You have joined the rank **${rankName}**.`);
    } else if (action === "leave") {
      const existing = await prisma.userRank.findFirst({
        where: { userId, rankId: rank.id },
      });

      if (!existing) {
        await interaction.reply(
          `You are not part of the rank **${rankName}**.`
        );
        return;
      }

      await prisma.userRank.delete({
        where: { id: existing.id },
      });

      await interaction.reply(`You have left the rank **${rankName}**.`);
    }
  },
};
