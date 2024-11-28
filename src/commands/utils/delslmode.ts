import { Command } from "../../types/command";
import { SlashCommandBuilder, TextChannel, PermissionFlagsBits } from "discord.js";

export const delslowmode: Command = {
 data: new SlashCommandBuilder()
   .setName("delslowmode")
   .setDescription("Remove the slowmode from a channel.")
   .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels) as SlashCommandBuilder,
 
 execute: async (interaction) => {
   // Ensure the bot has permission to manage the channel's slowmode
   if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
     await interaction.reply({
       content: "I don't have permission to remove slowmode from this channel.",
       ephemeral: true,
     });
     return;
   }

   // Remove slowmode in the channel
   if (interaction.channel instanceof TextChannel) {
     await interaction.channel.setRateLimitPerUser(0);
     await interaction.reply("Slowmode has been removed from this channel.");
   } else {
     await interaction.reply({
       content: "This command can only be used in text channels.",
       ephemeral: true,
     });
   }
 },
};