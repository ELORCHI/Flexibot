import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";

export const warn: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member in the server.")
    .addUserOption((option) => 
      option.setName("user").setDescription("The member to warn").setRequired(true)
    )
    .addStringOption((option) => 
      option.setName("reason").setDescription("The reason for the warning").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) as SlashCommandBuilder,
    
  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to warn or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // You can store the warnings in a database or file, here we simply log it for the sake of the example
    console.log(`${targetMember.user.tag} has been warned. Reason: ${reason}`);
    await interaction.reply(`${targetMember.user.tag} has been warned. Reason: ${reason}`);
  },
};