import { REST, Routes, Client } from 'discord.js';
import fs from 'fs';
import path from 'path';

async function registerGuildCommands(client: Client, guildId: string) {
  try {
    // Get the path to your commands directory
    if (!client.user) {
        console.error("Client is not logged in or user is not available.");
        return;
      }
    const commandsDir = path.join(__dirname, '../../commands'); // Adjust path based on your project structure

    // Function to recursively get all command files
    const getCommandFiles = (dir: string): string[] => {
      const files = fs.readdirSync(dir);
      let commandFiles: string[] = [];

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        // If it's a directory, recurse into it
        if (stats.isDirectory()) {
          commandFiles = commandFiles.concat(getCommandFiles(filePath));
        }
        // If it's a file with .ts extension, add it to the list
        else if (file.endsWith('.ts')) {
          commandFiles.push(filePath);
        }
      }
      return commandFiles;
    };

    // Get all command files in the commands directory (including subdirectories)
    const commandFiles = getCommandFiles(commandsDir);

    // Create an array to hold the command data
    const commandData = [];

    // Dynamically import each command file
    for (const file of commandFiles) {
      const command = await import(path.join(commandsDir, file));
      
      if (command.data) {
        commandData.push(command.data.toJSON()); // Convert SlashCommandBuilder to JSON
      }
    }

    // Initialize REST API client
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

    // Register commands for the guild
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commandData }
    );

    console.log(`Successfully registered commands in guild: ${guildId}`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

export { registerGuildCommands };
