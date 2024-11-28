import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionsBitField } from "discord.js";

export const deafen: Command = {
  data: new SlashCommandBuilder()
    .setName("deafen")
    .setDescription("Deafen a member in the voice channel.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to deafen").setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to deafen or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Check if the bot has permission to deafen the member
    if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
      await interaction.reply({
        content: "I don't have permission to deafen members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the member is already deafened
    if (targetMember.voice.serverDeaf) {
      await interaction.reply({
        content: `${targetMember.user.tag} is already deafened.`,
        ephemeral: true,
      });
      return;
    }

    // Deafen the target member
    await targetMember.voice.setDeaf(true);
    await interaction.reply(`${targetMember.user.tag} has been deafened.`);
  },
};
