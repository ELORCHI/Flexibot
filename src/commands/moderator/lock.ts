import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
  OverwriteType,
  OverwriteResolvable,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { Command } from "../../types/command";

// Utility function to parse duration
function parseDuration(duration: string): number {
  const units: { [key: string]: number } = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  };

  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid duration format. Use format like 1h, 30m, 7d");
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  // Enforce maximum duration of 28 days
  const maxDuration = 28 * 24 * 60 * 60 * 1000;
  const calculatedDuration = value * units[unit];

  return Math.min(calculatedDuration, maxDuration);
}

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

export const LockCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to lock")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Optional duration to lock the channel (e.g., 1h, 30m)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for locking the channel")
        .setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    // Ensure interaction is in a guild
    if (!interaction.guild || !interaction.channel) {
      const embed = createEmbed(
        "Invalid Usage",
        "This command can only be used in a server channel.",
        Colors.Red
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Get the channel to lock
    const channel = interaction.options.getChannel("channel") as TextChannel;

    // Get optional duration and reason
    const duration = interaction.options.getString("duration");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    try {
      // Get @everyone role
      const everyoneRole = interaction.guild.roles.everyone;

      // Convert permission overwrites to an array
      const originalOverwrites = Array.from(
        channel.permissionOverwrites.cache.values()
      );

      // Create new overwrites array including the lock for @everyone
      const newOverwrites: OverwriteResolvable[] = [
        ...originalOverwrites,
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.SendMessages],
          type: OverwriteType.Role,
        },
      ];

      // Modify channel permissions to prevent sending messages
      await channel.permissionOverwrites.set(newOverwrites, reason);

      // Send confirmation embed
      const successEmbed = createEmbed(
        "Channel Locked",
        `🔒 The channel ${channel.name} has been locked.\nReason: ${reason}`,
        Colors.Green
      );
      await interaction.reply({ embeds: [successEmbed], ephemeral: false });

      // Handle timed lock if duration is provided
      if (duration) {
        try {
          const durationMs = parseDuration(duration);

          // Set a timeout to unlock the channel
          setTimeout(async () => {
            try {
              // Restore original permissions
              await channel.permissionOverwrites.set(
                originalOverwrites,
                "Channel unlock after timed lock"
              );

              // Send unlock notification
              const unlockEmbed = createEmbed(
                "Channel Unlocked",
                `🔓 The channel ${channel.name} has been unlocked after the specified time.`,
                Colors.Blue
              );
              await channel.send({ embeds: [unlockEmbed] });
            } catch (unlockError) {
              console.error("Error unlocking channel:", unlockError);
            }
          }, durationMs);
        } catch (durationError) {
          const errorEmbed = createEmbed(
            "Invalid Duration",
            "The duration format is invalid. The channel will be locked indefinitely.",
            Colors.Red
          );
          await interaction.followUp({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      console.error("Lock command error:", error);
      const errorEmbed = createEmbed(
        "Lock Failed",
        "Failed to lock the channel. Please check my permissions.",
        Colors.Red
      );
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
