import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../types/command";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const addrank: Command = {
  data: new SlashCommandBuilder()
    .setName("addrank")
    .setDescription("Add a new rank to the server")
    .addStringOption((option) =>
      option
        .setName("rank_name")
        .setDescription("The name of the rank")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("role_name")
        .setDescription("The name of the Discord role")
        .setRequired(true)
    ) as SlashCommandBuilder,
  async execute(interaction) {
    const guildId = interaction.guildId;
    const rankName = interaction.options.getString("rank_name", true);
    const roleName = interaction.options.getString("role_name", true);
    const createdBy = interaction.user.id;

    if (!guildId) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const guild = await interaction.guild?.fetch();
    const role = guild?.roles.cache.find((r) => r.name === roleName);

    if (!role) {
      await interaction.reply(
        `The role **${roleName}** does not exist in this server.`
      );
      return;
    }

    await prisma.rank.create({
      data: {
        guildId,
        rankName,
        roleName,
        createdBy,
      },
    });

    await interaction.reply(
      `Rank **${rankName}** associated with role **${roleName}** added successfully!`
    );
  },
};

export default addrank;
