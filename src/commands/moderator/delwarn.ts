import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";

export const clearwarn: Command = {
  data: new SlashCommandBuilder()
    .setName("clearwarn")
    .setDescription("Clear a specific warning for a member.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to clear a warning for").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("warning_id").setDescription("The ID of the warning to clear").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) as SlashCommandBuilder,
  
  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");
    const warningId = interaction.options.getInteger("warning_id");

    // Validate member
    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to clear warning for or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // Validate warning ID
    if (!warningId) {
      await interaction.reply({
        content: "Please provide a valid warning ID.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Here you would typically interact with your database to remove the specific warning
      // This is a placeholder for your actual database logic
      // Example: await warningService.clearWarning(targetMember.id, warningId)
      
      console.log(`Warning ${warningId} for ${targetMember.user.tag} has been cleared.`);
      
      await interaction.reply({
        content: `Warning #${warningId} for ${targetMember.user.tag} has been cleared.`,
        ephemeral: false
      });
    } catch (error) {
      console.error("Error clearing warning:", error);
      await interaction.reply({
        content: "An error occurred while trying to clear the warning.",
        ephemeral: true
      });
    }
  },
};