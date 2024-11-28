import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionsBitField } from "discord.js";

export const setnick: Command = {
  data: new SlashCommandBuilder()
    .setName("setnick")
    .setDescription("Change the nickname of a user.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to change the nickname of").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("nickname").setDescription("The new nickname").setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");
    const nickname = interaction.options.getString("nickname")!;

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to change the nickname of.",
        ephemeral: true,
      });
      return;
    }

    // Ensure the bot has permission to change the nickname
    if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      await interaction.reply({
        content: "I don't have permission to change nicknames.",
        ephemeral: true,
      });
      return;
    }

    await targetMember.setNickname(nickname);
    await interaction.reply(`${targetMember.user.tag}'s nickname has been changed to ${nickname}`);
  },
};
