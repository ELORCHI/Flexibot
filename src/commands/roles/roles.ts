import { Command } from "../../types/command";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const roles: Command = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Display all server roles"),
  execute: async (interaction) => {
    // Ensure the interaction is in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    // Fetch all roles in the server, excluding @everyone
    const serverRoles = interaction.guild.roles.cache
      .filter((role) => role.name !== "@everyone")
      .sort((a, b) => b.position - a.position) // Sort roles by position (highest to lowest)
      .map((role) => `• ${role.name} (ID: ${role.id})`);

    // Create an embed to display the roles
    const embed = new EmbedBuilder()
      .setTitle("Server Roles")
      .setDescription(
        serverRoles.length > 0
          ? serverRoles.join("\n")
          : "No custom roles found in this server."
      )
      .setColor(0x00aeff)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // Reply with the embed
    await interaction.reply({ embeds: [embed] });
  },
};
