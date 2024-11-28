import { Command } from "../../types/command";
import { SlashCommandBuilder } from "discord.js";

export const modlogs: Command = {
  data: new SlashCommandBuilder()
    .setName("modlogs")
    .setDescription("Show the moderation logs for the server."),

  execute: async (interaction) => {
    // Here, you'd typically fetch data from a database or file system.
    // For this example, we'll return a static message with placeholder logs.

    const logs = [
      "User: exampleUser1 - Action: Warn - Reason: Spamming",
      "User: exampleUser2 - Action: Kick - Reason: Toxic Behavior",
      "User: exampleUser3 - Action: Ban - Reason: Cheating",
    ];

    const logMessage = logs.join("\n");

    await interaction.reply({
      content: `Moderation Logs:\n${logMessage}`,
      ephemeral: true,
    });
  },
};
