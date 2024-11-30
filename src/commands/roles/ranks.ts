import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../../types/command";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("ranks")
    .setDescription("List all ranks in the server"),
  async execute(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const ranks = await prisma.rank.findMany({
      where: { guildId },
    });

    if (!ranks.length) {
      await interaction.reply("No ranks have been set up in this server.");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Ranks in this Server")
      .setDescription(
        ranks
          .map((rank) => `• **${rank.rankName}**: ${rank.roleName}`)
          .join("\n")
      )
      .setColor(0x00ff00);

    await interaction.reply({ embeds: [embed] });
  },
};

export default rank;
