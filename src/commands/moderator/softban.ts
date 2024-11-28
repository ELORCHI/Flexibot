import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";

export const softban: Command = {
  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("Softban a member (ban and immediately unban to clear messages).")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to softban").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the softban").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
  
  execute: async (interaction) => {
    // Ensure the bot has ban permissions
    if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: "I don't have permission to ban members.",
        ephemeral: true,
      });
      return;
    }

    const targetMember = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    // Validate the target member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to softban.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Ban the user (with delete message days set to 7 to clear recent messages)
      await interaction.guild.bans.create(targetMember.user, {
        reason: `Softban: ${reason}`,
        deleteMessageDays: 7
      });

      // Immediately unban the user
      await interaction.guild.bans.remove(targetMember.user, `Softban completed: ${reason}`);

      // Confirm the softban
      await interaction.reply({
        content: `${targetMember.user.tag} has been softbanned. Recent messages have been cleared.`,
        ephemeral: false
      });
    } catch (error) {
      console.error("Softban error:", error);
      await interaction.reply({
        content: "An error occurred while attempting to softban the member.",
        ephemeral: true
      });
    }
  },
};