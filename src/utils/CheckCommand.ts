import { ChatInputCommandInteraction, GuildChannel } from "discord.js";
import { PrismaClient } from "@prisma/client";

interface CommandCheckResult {
  allowed: boolean;
  reason?: string;
}

export async function checkCommandPermissions(
  interaction: ChatInputCommandInteraction,
  prisma: PrismaClient
): Promise<CommandCheckResult> {
  // First, fetch the command configuration from the database
  const commandConfig = await prisma.command.findUnique({
    where: {
      guildId_name: {
        guildId: interaction.guildId!,
        name: interaction.commandName,
      },
    },
  });

  // If no command config found, default to allowing the command
  if (!commandConfig) {
    return { allowed: false };
  }

  // Check if command is globally enabled
  if (!commandConfig.enabled) {
    return {
      allowed: false,
      reason: "This command is currently disabled.",
    };
  }

  // Check channel restrictions
  if (commandConfig.allowedChannels || commandConfig.ignoredChannels) {
    // Safely get channel name, ensuring it's a guild channel
    const currentChannel = interaction.channel;
    const currentChannelName =
      currentChannel instanceof GuildChannel ? currentChannel.name : undefined;

    // Check allowed channels (if specified)
    if (commandConfig.allowedChannels && currentChannelName) {
      const allowedChannels = commandConfig.allowedChannels.split("+");
      if (!allowedChannels.includes(currentChannelName)) {
        return {
          allowed: false,
          reason: "This command cannot be used in this channel.",
        };
      }
    }

    // Check ignored channels
    if (commandConfig.ignoredChannels && currentChannelName) {
      const ignoredChannels = commandConfig.ignoredChannels.split("+");
      if (ignoredChannels.includes(currentChannelName)) {
        return {
          allowed: false,
          reason: "This command is not allowed in this channel.",
        };
      }
    }
  }

  // Check role restrictions
  if (commandConfig.allowedRoles || commandConfig.ignoredRoles) {
    // Get the member's role names with proper type handling
    const memberRoleNames =
      interaction.member?.roles instanceof Array
        ? [] // Handle array case if needed
        : Array.from(
            (interaction.member?.roles as any)?.cache?.map(
              (role: any) => role.name
            ) || []
          );

    // Check allowed roles (if specified)
    if (commandConfig.allowedRoles) {
      const allowedRoles = commandConfig.allowedRoles.split("+");
      if (
        !memberRoleNames.some((roleName) =>
          allowedRoles.includes(String(roleName))
        )
      ) {
        return {
          allowed: false,
          reason: "You do not have permission to use this command.",
        };
      }
    }

    // Check ignored roles
    if (commandConfig.ignoredRoles) {
      const ignoredRoles = commandConfig.ignoredRoles.split("+");
      if (
        memberRoleNames.some((roleName) =>
          ignoredRoles.includes(String(roleName))
        )
      ) {
        return {
          allowed: false,
          reason: "You are not allowed to use this command.",
        };
      }
    }
  }

  // If all checks pass, allow the command
  return { allowed: true };
}
