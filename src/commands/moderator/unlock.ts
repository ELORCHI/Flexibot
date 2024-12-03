import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  TextChannel,
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

export const unlock: Command = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a channel.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to unlock")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    // Ensure the bot has permission to manage channel permissions
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      const errorEmbed = createEmbed(
        "Permission Denied",
        "I don't have permission to manage channels.",
        Colors.Red
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    // Get the channel to unlock
    const channel = interaction.options.getChannel("channel") as TextChannel;
    await interaction.deferReply({ ephemeral: true });
    if (channel instanceof TextChannel) {
      try {
        // Modify the channel permissions to allow sending messages
        await channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: true,
        });

        // Send confirmation embed
        const successEmbed = createEmbed(
          "Channel Unlocked",
          `${channel.name} is now unlocked.`,
          Colors.Green
        );
        await interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        console.error("Error unlocking channel:", error);
        const errorEmbed = createEmbed(
          "Unlock Failed",
          "There was an error unlocking the channel. Please try again later.",
          Colors.Red
        );
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    } else {
      const errorEmbed = createEmbed(
        "Invalid Channel",
        "The specified channel is not a valid text channel.",
        Colors.Red
      );
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
