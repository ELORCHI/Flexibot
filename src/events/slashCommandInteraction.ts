import { Interaction, ChatInputCommandInteraction } from "discord.js";
import ClientWithCommands from "../types/discord";
import { Command } from "../types/command";

export default {
  name: "interactionCreate",
  async execute(interaction: Interaction, client: ClientWithCommands) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(
      interaction.commandName
    ) as unknown as Command;
    if (!command) {
      return await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
