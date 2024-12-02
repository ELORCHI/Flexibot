import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Role,
} from "discord.js";

export const deleterole: Command = {
  data: new SlashCommandBuilder()
    .setName("deleterole")
    .setDescription("Delete a role from the server")
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role to delete").setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ) as SlashCommandBuilder,
  execute: async (interaction) => {
    // Ensure the interaction is in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    // Verify user has manage server permissions
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      const noPermEmbed = new EmbedBuilder()
        .setColor(0xff0000) // Red color for error
        .setTitle("❌ Permission Denied")
        .setDescription(
          "You need the **Manage Server** permission to delete roles."
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [noPermEmbed],
        ephemeral: true,
      });
      return;
    }

    // Get the role to delete
    const roleOption = interaction.options.getRole("role", true);

    // Fetch the actual Role object from the guild
    const roleToDelete = interaction.guild.roles.cache.get(roleOption.id);

    // Validate role
    if (!roleToDelete) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Invalid Role")
        .setDescription("The specified role could not be found in this server.")
        .setTimestamp();

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
      return;
    }

    try {
      // Additional checks before deletion
      if (roleToDelete.managed) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff0000) // Red color for error
          .setTitle("❌ Cannot Delete Role")
          .setDescription(
            "This role is managed by an integration and cannot be deleted."
          )
          .addFields(
            { name: "Role", value: roleToDelete.toString(), inline: true },
            { name: "Managed By", value: "External Integration", inline: true }
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
        return;
      }

      // If the role is the @everyone role or highest role, prevent deletion
      if (
        roleToDelete.id === interaction.guild.id ||
        roleToDelete.position >=
          interaction.guild.members.me?.roles.highest.position!
      ) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff0000) // Red color for error
          .setTitle("❌ Cannot Delete Role")
          .setDescription(
            "This role cannot be deleted due to hierarchy restrictions."
          )
          .addFields({
            name: "Role",
            value: roleToDelete.toString(),
            inline: true,
          })
          .setTimestamp();

        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
        return;
      }

      // Delete the role
      await roleToDelete.delete(`Role deleted by ${interaction.user.tag}`);

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor(0x00ff00) // Green color for success
        .setTitle("✅ Role Deleted Successfully")
        .setDescription(`The role **${roleToDelete.name}** has been deleted.`)
        .addFields(
          {
            name: "Deleted By",
            value: interaction.user.toString(),
            inline: true,
          },
          { name: "Role Name", value: roleToDelete.name, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL() || undefined,
        });

      await interaction.reply({
        embeds: [successEmbed],
      });
    } catch (error) {
      console.error("Error deleting role:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000) // Red color for error
        .setTitle("❌ Error Deleting Role")
        .setDescription(
          "An unexpected error occurred while trying to delete the role."
        )
        .addFields({
          name: "Role",
          value: roleToDelete.toString(),
          inline: true,
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};
