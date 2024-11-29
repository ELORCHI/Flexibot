import { Command } from "../../types/command";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const userinfo: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get information about a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to fetch info about")
        .setRequired(false)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff) // This is the correct numeric format for color
      .setTitle(`${targetUser.tag}'s Information`)
      .addFields(
        { name: "User ID", value: targetUser.id, inline: true },
        { name: "Username", value: targetUser.username, inline: true },
        {
          name: "Discriminator",
          value: `#${targetUser.discriminator}`,
          inline: true,
        },
        {
          name: "Account Created",
          value: targetUser.createdAt.toDateString(),
          inline: false,
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
