import { Command } from "../../types/command";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export const createrole: Command = {
  data: new SlashCommandBuilder()
    .setName("createrole")
    .setDescription("Create a new role in the server")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the new role")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Hex color code for the role (optional)")
        .setRequired(false)
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

    // Check if user has permissions to manage roles
    // Use optional chaining and nullish coalescing to handle potential null
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: "You do not have permission to create roles.",
        ephemeral: true,
      });
      return;
    }

    // Get role name and color from options
    const roleName = interaction.options.getString("name", true);
    const colorOption = interaction.options.getString("color");

    try {
      // Validate color if provided
      let roleColor;
      if (colorOption) {
        // Remove # if present and validate hex color
        const sanitizedColor = colorOption.replace(/^#/, "");

        // Check if it's a valid hex color (6 characters of hex)
        if (!/^[0-9A-Fa-f]{6}$/.test(sanitizedColor)) {
          await interaction.reply({
            content:
              "Invalid color code. Please use a valid 6-digit hex color (e.g., FF0000 for red).",
            ephemeral: true,
          });
          return;
        }

        roleColor = parseInt(sanitizedColor, 16);
      }

      // Create the role
      const newRole = await interaction.guild.roles.create({
        name: roleName,
        color: roleColor, // Will be undefined if no color provided
        reason: `Role created by ${interaction.user.tag}`,
      });

      // Confirm role creation
      await interaction.reply({
        content: `Role **${newRole.name}** has been created successfully!`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error creating role:", error);
      await interaction.reply({
        content:
          "There was an error creating the role. Please check the role name and try again.",
        ephemeral: true,
      });
    }
  },
};
