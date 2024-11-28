import { Command } from "../../types/command";
import { SlashCommandBuilder, TextChannel, PermissionsBitField } from "discord.js";

export const lock: Command = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel with an optional timer.")
    .addIntegerOption((option) =>
      option.setName("time").setDescription("Time in seconds to lock the channel").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("The message to display when the channel is locked").setRequired(false)
    ),

  execute: async (interaction) => {
    // Ensure that interaction.guild is not null
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const time = interaction.options.getInteger("time")! * 1000 || 0; // Convert seconds to milliseconds
    const message = interaction.options.getString("message") || "This channel is locked.";

    // Ensure the bot has permission to manage channel permissions
    if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      await interaction.reply({
        content: "I don't have permission to manage channels.",
        ephemeral: true,
      });
      return;
    }

    // Check if the channel is a TextChannel and ensure it's not null
    const channel = interaction.channel;
    if (channel && channel instanceof TextChannel) {
      // Lock the channel by disabling sending messages
      await channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false,
      });

      await interaction.reply(`${channel.name} is now locked. ${message}`);

      if (time > 0) {
        setTimeout(async () => {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: true,
          });
          await interaction.followUp(`${channel.name} is now unlocked.`);
        }, time);
      }
    } else {
      await interaction.reply({
        content: "This command can only be used in text channels.",
        ephemeral: true,
      });
    }
  },
};
