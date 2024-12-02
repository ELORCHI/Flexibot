import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";

export const slowmode: Command = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set a slowmode in a channel.")
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the slowmode in seconds.")
        .setRequired(true)
        .setMinValue(0)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const duration = interaction.options.getInteger("duration");
    if (!duration) {
      await interaction.reply({
        content: "You must specify a valid duration.",
        ephemeral: true,
      });
      return;
    }

    // Ensure the bot has permission to manage the channel's slowmode
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      await interaction.reply({
        content: "I don't have permission to set a slowmode in this channel.",
        ephemeral: true,
      });
      return;
    }

    // Set the slowmode in the channel
    if (interaction.channel instanceof TextChannel) {
      await interaction.channel.setRateLimitPerUser(duration);
      await interaction.reply(`Slowmode has been set to ${duration} seconds.`);
    } else {
      await interaction.reply({
        content: "This command can only be used in text channels.",
        ephemeral: true,
      });
    }
  },
};
