import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember } from "discord.js";

export const clearwarn: Command = {
  data: new SlashCommandBuilder()
    .setName("clearwarn")
    .setDescription("Clear all warnings for a member.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The member to clear warnings for").setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member to clear warnings for or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    // You would typically interact with a database to clear warnings here.
    // For this example, we log it to the console.
    console.log(`All warnings for ${targetMember.user.tag} have been cleared.`);

    await interaction.reply(`${targetMember.user.tag}'s warnings have been cleared.`);
  },
};
