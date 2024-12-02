import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";

export const clear: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear a specified number of messages.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The number of messages to clear")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const amount = interaction.options.getInteger("amount");

    // Ensure the bot has permission to manage messages
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      await interaction.reply({
        content: "I don't have permission to manage messages.",
        ephemeral: true,
      });
      return;
    }

    // Ensure the command is used in a text channel
    if (interaction.channel instanceof TextChannel) {
      await interaction.channel.bulkDelete(amount!, true);
      await interaction.reply(`Deleted ${amount} messages.`);
    } else {
      await interaction.reply({
        content: "This command can only be used in text channels.",
        ephemeral: true,
      });
    }
  },
};
