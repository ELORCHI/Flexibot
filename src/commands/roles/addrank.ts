import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Role,
  User,
  ColorResolvable,
} from "discord.js";
import { Command } from "../../types/command";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generates an embed for consistent responses.
 * @param title - The title of the embed.
 * @param description - The description or main content of the embed.
 * @param color - The color of the embed. Must be a valid `ColorResolvable`.
 * @param user - The user executing the command, used for footer context.
 * @returns {EmbedBuilder} - The constructed embed.
 */
const generateEmbed = (
  title: string,
  description: string,
  color: ColorResolvable,
  user: User
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({
      text: `Requested by ${user.tag}`,
      iconURL: user.displayAvatarURL(),
    })
    .setTimestamp();
};

const addrank: Command = {
  data: new SlashCommandBuilder()
    .setName("addrank")
    .setDescription("Add a new rank to the server")
    .addStringOption((option) =>
      option
        .setName("rank_name")
        .setDescription("The name of the rank")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Discord role to associate with the rank")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ) as SlashCommandBuilder,

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;
    const rankName = interaction.options.getString("rank_name", true);
    const role = interaction.options.getRole("role", true) as Role;
    const createdBy = interaction.user.id;

    if (!guildId) {
      const embed = generateEmbed(
        "Error",
        "This command can only be used in a server.",
        "Red",
        interaction.user
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    try {
      // Save the rank in the database
      await prisma.rank.create({
        data: {
          guildId,
          rankName,
          roleName: role.name,
          createdBy,
        },
      });

      const embed = generateEmbed(
        "Rank Added",
        `Rank **${rankName}** has been successfully associated with role **${role.name}**.`,
        "Green",
        interaction.user
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error adding rank:", error);

      const embed = generateEmbed(
        "Error",
        "An error occurred while trying to add the rank. Please try again later.",
        "Red",
        interaction.user
      );

      await interaction.editReply({ embeds: [embed] });
    }
  },
};

export default addrank;
