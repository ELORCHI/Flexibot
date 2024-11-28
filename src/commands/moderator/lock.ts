import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    PermissionFlagsBits,
    TextChannel,
    OverwriteType,
    OverwriteResolvable
} from "discord.js";

export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// Utility function to parse duration
function parseDuration(duration: string): number {
    const units: { [key: string]: number } = {
        's': 1000,           // seconds
        'm': 60 * 1000,      // minutes
        'h': 60 * 60 * 1000, // hours
        'd': 24 * 60 * 60 * 1000 // days
    };

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error('Invalid duration format. Use format like 1h, 30m, 7d');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    // Enforce maximum duration of 28 days
    const maxDuration = 28 * 24 * 60 * 60 * 1000;
    const calculatedDuration = value * units[unit];
    
    return Math.min(calculatedDuration, maxDuration);
}

export const LockCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel')
        .addStringOption(option => 
            option
                .setName('duration')
                .setDescription('Optional duration to lock the channel (e.g., 1h, 30m)')
                .setRequired(false)
        )
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason for locking the channel')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        // Ensure interaction is in a guild
        if (!interaction.guild || !interaction.channel) {
            await interaction.reply({ 
                content: 'This command can only be used in a server channel.', 
                ephemeral: true 
            });
            return;
        }

        // Verify the channel is a text channel
        const channel = interaction.channel as TextChannel;

        // Get optional duration and reason
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Get @everyone role
            const everyoneRole = interaction.guild.roles.everyone;

            // Convert permission overwrites to an array
            const originalOverwrites = Array.from(channel.permissionOverwrites.cache.values());

            // Create new overwrites array including the lock for @everyone
            const newOverwrites: OverwriteResolvable[] = [
                ...originalOverwrites,
                {
                    id: everyoneRole.id,
                    deny: [PermissionFlagsBits.SendMessages],
                    type: OverwriteType.Role
                }
            ];

            // Modify channel permissions to prevent sending messages
            await channel.permissionOverwrites.set(newOverwrites, reason);

            // Send confirmation message
            await interaction.reply({
                content: `🔒 Channel locked. Reason: ${reason}`,
                ephemeral: false
            });

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
                                'Channel unlock after timed lock'
                            );

                            // Send unlock notification
                            await channel.send('🔓 Channel has been unlocked.');
                        } catch (unlockError) {
                            console.error('Error unlocking channel:', unlockError);
                        }
                    }, durationMs);

                } catch (durationError) {
                    await interaction.followUp({
                        content: 'Invalid duration format. Channel locked without a timer.',
                        ephemeral: true
                    });
                }
            }

        } catch (error) {
            console.error('Lock command error:', error);
            await interaction.reply({
                content: 'Failed to lock the channel. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};