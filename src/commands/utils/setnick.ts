import { Command } from "../../types/command";
import {
  SlashCommandBuilder,
  GuildMember,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";

// Utility function to create embeds
const createEmbed = (
  title: string,
  description: string,
  color: `#${string}` | number
) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
};

export const setnick: Command = {
  data: new SlashCommandBuilder()
    .setName("setnick")
    .setDescription("Change the nickname of a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to change the nickname of")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("The new nickname")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");
    const nickname = interaction.options.getString("nickname")!;

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      const errorEmbed = createEmbed(
        "Error",
        "Could not find the member to change the nickname of.",
        Colors.Red
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    // Ensure the bot has permission to change the nickname
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ManageNicknames
      )
    ) {
      const permissionErrorEmbed = createEmbed(
        "Permission Denied",
        "I don't have permission to change nicknames.",
        Colors.Red
      );
      await interaction.editReply({ embeds: [permissionErrorEmbed] });
      return;
    }

    try {
      await targetMember.setNickname(nickname);

      const successEmbed = createEmbed(
        "Nickname Changed",
        `${targetMember.user.tag}'s nickname has been changed to **${nickname}**.`,
        Colors.Green
      );
      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      const errorEmbed = createEmbed(
        "Error",
        "There was an error while changing the nickname. Please try again later.",
        Colors.Red
      );
      console.error("Error setting nickname:", error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
