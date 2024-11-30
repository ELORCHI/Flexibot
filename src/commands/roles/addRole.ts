import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types/command";

export const addRoleCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Adds a role to a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add the role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to add to the user")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");

    if (!user || !role) {
      await interaction.reply({
        content: "User or role not provided.",
        ephemeral: true,
      });
      return;
    }

    // Ensure the role is a valid Role object
    const resolvedRole = interaction.guild?.roles.cache.get(role.id);
    if (!resolvedRole) {
      await interaction.reply({
        content: "Role not found in the server.",
        ephemeral: true,
      });
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id);

    if (!member) {
      await interaction.reply({
        content: "Member not found in the server.",
        ephemeral: true,
      });
      return;
    }

    try {
      await member.roles.add(resolvedRole); // Use the resolved Role
      await interaction.reply({
        content: `Successfully added the ${resolvedRole.name} role to ${user.username}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error adding the role.",
        ephemeral: true,
      });
    }
  },
};
