import { Command } from "../../types/command";
import { SlashCommandBuilder } from "discord.js";

export const serverinfo: Command = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Display information about the server."),

  execute: async (interaction) => {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const serverName = guild.name;
    const memberCount = guild.memberCount;
    const creationDate = guild.createdAt.toDateString();

    await interaction.reply(
      `Server Info:\nName: ${serverName}\nMembers: ${memberCount}\nCreated On: ${creationDate}`
    );
  },
};
