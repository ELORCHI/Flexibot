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
  // First, fetch the command configuration from the database with guild details
  const commandConfig = await prisma.command.findUnique({
    where: {
      guildId_name: {
        guildId: interaction.guildId!,
        name: interaction.commandName,
      },
    },
    include: {
      guild: true,
    },
  });

  // If no command config found, default to disallowing the command
  if (!commandConfig) {
    return {
      allowed: false,
      reason: "Command configuration not found.",
    };
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

  // Get member's role names
  const memberRoleNames =
    interaction.member?.roles instanceof Array
      ? [] // Handle array case if needed
      : Array.from(
          (interaction.member?.roles as any)?.cache?.map(
            (role: any) => role.name
          ) || []
        );

  // Get guild manager roles
  const guildManagerRoles = commandConfig.guild?.managerRoles || [];

  // Check if command needs moderation role
  if (commandConfig.needsModerationRole) {
    // Check if user has either a manager role or an allowed role
    const hasManagerRole = memberRoleNames.some((roleName) =>
      guildManagerRoles.includes(String(roleName))
    );

    const hasAllowedRole = commandConfig.allowedRoles
      ? memberRoleNames.some((roleName) =>
          commandConfig.allowedRoles!.split("+").includes(String(roleName))
        )
      : false;

    if (!hasManagerRole && !hasAllowedRole) {
      return {
        allowed: false,
        reason:
          "This command requires a moderation role or specific allowed roles.",
      };
    }
  } else {
    // For commands not requiring moderation role, proceed with existing role checks
    // Check allowed roles (if specified)
    if (commandConfig.allowedRoles) {
      const allowedRoles = commandConfig.allowedRoles.split("+");
      const hasAllowedRole = memberRoleNames.some((roleName) =>
        allowedRoles.includes(String(roleName))
      );

      if (!hasAllowedRole) {
        return {
          allowed: false,
          reason: "You do not have permission to use this command.",
        };
      }
    }
  }

  // Check ignored roles
  if (commandConfig.ignoredRoles) {
    const ignoredRoles = commandConfig.ignoredRoles.split("+");
    const hasIgnoredRole = memberRoleNames.some((roleName) =>
      ignoredRoles.includes(String(roleName))
    );

    if (hasIgnoredRole) {
      return {
        allowed: false,
        reason: "You are not allowed to use this command.",
      };
    }
  }

  // If all checks pass, allow the command
  return { allowed: true };
}
