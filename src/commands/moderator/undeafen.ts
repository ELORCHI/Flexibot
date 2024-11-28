import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";

export const undeafen: Command = {
  data: new SlashCommandBuilder()
    .setName("undeafen")
    .setDescription("Undeafen a member in the voice channel.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to undeafen").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to undeafen or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Check if the bot has permission to undeafen the member
    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.DeafenMembers)) {
      await interaction.reply({
        content: "I don't have permission to undeafen members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the member is already undeafened
    if (!targetMember.voice.serverDeaf) {
      await interaction.reply({
        content: `${targetMember.user.tag} is not deafened.`,
        ephemeral: true,
      });
      return;
    }

    // Undeafen the target member
    await targetMember.voice.setDeaf(false);
    await interaction.reply(`${targetMember.user.tag} has been undeafened.`);
  },
};
