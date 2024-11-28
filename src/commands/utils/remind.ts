import { Command } from "../../types/command";
import { SlashCommandBuilder } from "discord.js";

export const remind: Command = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder.")
    .addStringOption((option) =>
      option.setName("message").setDescription("The reminder message").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("time").setDescription("Time in seconds for the reminder").setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const message = interaction.options.getString("message")!;
    const time = interaction.options.getInteger("time")! * 1000; // Convert seconds to milliseconds

    await interaction.reply({
      content: `Reminder set! I will remind you in ${time / 1000} seconds.`,
      ephemeral: true,
    });

    setTimeout(async () => {
      await interaction.followUp({ content: `Reminder: ${message}` });
    }, time);
  },
};
