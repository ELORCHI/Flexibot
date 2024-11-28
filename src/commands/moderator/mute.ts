import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionFlagsBits} from "discord.js";

export const mute: Command = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member in the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to mute").setRequired(true)
    ).setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to mute or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Check if the bot has permission to mute the member
    const botMember = interaction.guild?.members.me;
    if (!botMember || !botMember.permissions.has(PermissionFlagsBits.MuteMembers)) {
      await interaction.reply({
        content: "I don't have permission to mute members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the target member is already muted
    if (targetMember.voice.serverMute) {
      await interaction.reply({
        content: `${targetMember.user.tag} is already muted.`,
        ephemeral: true,
      });
      return;
    }

    // Mute the target member
    await targetMember.voice.setMute(true);
    await interaction.reply(`${targetMember.user.tag} has been muted.`);
  },
};
