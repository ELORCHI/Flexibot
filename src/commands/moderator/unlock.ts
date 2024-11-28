import { Command } from "../../types/command";
import { SlashCommandBuilder, TextChannel, PermissionFlagsBits } from "discord.js";

export const unlock: Command = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels) as SlashCommandBuilder,


  execute: async (interaction) => {
    // Ensure the bot has permission to manage channel permissions
    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({
        content: "I don't have permission to manage channels.",
        ephemeral: true,
      });
      return;
    }

    if (interaction.channel instanceof TextChannel) {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: true,
      });

      await interaction.reply(`${interaction.channel.name} is now unlocked.`);
    }
  },
};
