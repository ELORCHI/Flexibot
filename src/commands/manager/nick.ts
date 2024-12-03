import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";

// Utility function to create embeds
const createEmbed = (
  title: string,
  description: string,
  color: `#${string}` | number
) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
};

export const nick: Command = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change the bot's nickname.")
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("The new nickname for the bot")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const nickname = interaction.options.getString("nickname")!;

    // Ensure the bot has permission to change its own nickname
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ManageNicknames
      )
    ) {
      const permissionErrorEmbed = createEmbed(
        "Permission Denied",
        "I don't have permission to change my nickname.",
        Colors.Red
      );
      await interaction.reply({
        embeds: [permissionErrorEmbed],
        ephemeral: true,
      });
      return;
    }

    try {
      // Change the bot's nickname
      await interaction.guild.members.me?.setNickname(nickname);

      const successEmbed = createEmbed(
        "Nickname Changed",
        `My nickname has been changed to **${nickname}**.`,
        Colors.Green
      );
      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      const errorEmbed = createEmbed(
        "Error",
        "There was an error while changing my nickname. Please try again later.",
        Colors.Red
      );
      console.error("Error setting bot nickname:", error);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
