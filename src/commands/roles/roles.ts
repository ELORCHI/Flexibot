import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember } from "discord.js";

export const roles: Command = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Display the roles of a member.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to check roles for").setRequired(true)
    )as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    const roles = targetMember.roles.cache.map((role) => role.name).join(", ");
    await interaction.reply(`${targetMember.user.tag} has the following roles: ${roles}`);
  },
};
