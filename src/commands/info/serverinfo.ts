import { Command } from "../../types/command";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const serverinfo: Command = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Display information about the server."),

  execute: async (interaction) => {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const serverName = guild.name;
    const memberCount = guild.memberCount;
    const creationDate = guild.createdAt.toDateString();

    // Use the server icon or fallback to the bot's avatar.
    const iconURL =
      guild.iconURL({ size: 1024 }) ||
      interaction.client.user?.displayAvatarURL();

    const embed = new EmbedBuilder()
      .setTitle("Server Information")
      .setThumbnail(iconURL || "") // Ensure a fallback string if undefined
      .setColor("Blue")
      .addFields(
        { name: "Server Name", value: serverName, inline: true },
        { name: "Member Count", value: `${memberCount}`, inline: true },
        { name: "Created On", value: creationDate, inline: false }
      )
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
