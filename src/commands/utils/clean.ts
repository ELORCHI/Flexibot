import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";

export const clean: Command = {
  data: new SlashCommandBuilder()
    .setName("clean")
    .setDescription("Clean messages from the channel.")
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("The content to filter by")
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Delete messages from a specific user")
        .setRequired(false)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const content = interaction.options.getString("content");
    const user = interaction.options.getUser("user");

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
      let messages = await interaction.channel.messages.fetch({ limit: 100 });
      if (content) {
        messages = messages.filter((msg) => msg.content.includes(content));
      }
      if (user) {
        messages = messages.filter((msg) => msg.author.id === user.id);
      }
      await interaction.channel.bulkDelete(messages, true);
      await interaction.reply(`Cleaned ${messages.size} messages.`);
    } else {
      await interaction.reply({
        content: "This command can only be used in text channels.",
        ephemeral: true,
      });
    }
  },
};
