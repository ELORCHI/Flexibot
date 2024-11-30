import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../types/command";

export const roleInfoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Get information about a role")
    .addStringOption((option) =>
      option
        .setName("rolename")
        .setDescription("The name of the role to get info about")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    const roleName = interaction.options.getString("rolename");

    if (!roleName) {
      await interaction.reply({
        content: "Please provide a role name.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Fetch the role from the guild by name
      const role = interaction.guild?.roles.cache.find(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      );

      if (!role) {
        await interaction.reply({
          content: `Role "${roleName}" not found in this guild.`,
          ephemeral: true,
        });
        return;
      }

      // Create the embed with the role information
      const embed = new EmbedBuilder()
        .setColor(role.color)
        .setTitle(`Role Information: ${role.name}`)
        .setDescription(
          `Here is the information for the **${role.name}** role.`
        )
        .addFields(
          { name: "Role ID", value: role.id },
          { name: "Role Color", value: role.color.toString() },
          {
            name: "Permissions",
            value: role.permissions.toArray().join(", ") || "None",
          },
          { name: "Position", value: role.position.toString() },
          { name: "Hoisted", value: role.hoist ? "Yes" : "No" },
          { name: "Mentionable", value: role.mentionable ? "Yes" : "No" },
          { name: "Created At", value: role.createdAt.toDateString() }
        )
        .setTimestamp();

      // Send the embed in the response
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error fetching the role information.",
        ephemeral: true,
      });
    }
  },
};
