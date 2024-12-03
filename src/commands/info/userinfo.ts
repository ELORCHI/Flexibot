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
    const avatarURL = targetUser.displayAvatarURL({ size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.tag}'s Information`)
      .setThumbnail(avatarURL)
      .setColor("Blue")
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
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
