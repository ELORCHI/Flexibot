import { Command } from "../../types/command";
import { SlashCommandBuilder, GuildMember, EmbedBuilder } from "discord.js";

export const roles: Command = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Display the roles of a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to check roles for")
        .setRequired(true)
    ) as SlashCommandBuilder,

  execute: async (interaction) => {
    const targetMember = interaction.options.getMember("user");

    if (!targetMember || !(targetMember instanceof GuildMember)) {
      await interaction.reply({
        content: "Could not find the member or the user is not a valid member.",
        ephemeral: true,
      });
      return;
    }

    const roles = targetMember.roles.cache
      .filter((role) => role.name !== "@everyone") // Exclude the default @everyone role
      .map((role) => role.name)
      .join(", ");

    const embed = new EmbedBuilder()
      .setTitle(`${targetMember.user.tag}'s Roles`)
      .setDescription(roles || "This member has no roles.")
      .setColor(0x00aeff)
      .setThumbnail(targetMember.user.displayAvatarURL())
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
