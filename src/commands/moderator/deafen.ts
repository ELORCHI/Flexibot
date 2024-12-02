import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

export const deafen: Command = {
  data: new SlashCommandBuilder()
    .setName("deafen")
    .setDescription("Deafen a member in the voice channel.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to deafen")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content:
          "Could not find the member to deafen or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Check if the bot has permission to deafen the member
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.DeafenMembers
      )
    ) {
      await interaction.reply({
        content: "I don't have permission to deafen members.",
        ephemeral: true,
      });
      return;
    }

    // Check if the member is connected to a voice channel
    if (!targetMember.voice.channel) {
      await interaction.reply({
        content: `${targetMember.user.tag} is not connected to a voice channel.`,
        ephemeral: true,
      });
      return;
    }

    if (targetMember.voice.serverDeaf) {
      await interaction.reply({
        content: `${targetMember.user.tag} is already deafened.`,
        ephemeral: true,
      });
      return;
    }

    await targetMember.voice.setDeaf(true);

    const embed = new EmbedBuilder()
      .setTitle("Member Deafened")
      .setColor("Red")
      .addFields(
        { name: "Member", value: `${targetMember.user.tag}`, inline: true },
        { name: "Action", value: "Deafened", inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true }
      )
      .setFooter({
        text: `Guild: ${interaction.guild.name}`,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
