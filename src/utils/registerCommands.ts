import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import ClientWithCommands from "../types/discord";

async function registerGuildCommands(
  client: ClientWithCommands,
  guildId: string
) {
  try {
    if (!client.user) {
      console.error("Client is not logged in or user is not available.");
      return;
    }
    // Get the path to your commands directory
    const commandsDir = path.join(__dirname, "../../src/commands"); // Adjust path based on your project structure
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
        else if (file.endsWith(".ts")) {
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
    // Dynamically import each command file
    for (const file of commandFiles) {
      try {
        const commandModule = await import(file);

        // Loop through all named exports to find valid commands
        for (const exportKey in commandModule) {
          const command = commandModule[exportKey];

          if (command?.data) {
            commandData.push(command.data.toJSON()); // Convert SlashCommandBuilder to JSON
          } else {
            console.warn(
              `Export "${exportKey}" in file ${file} is not a valid command.`
            );
          }
        }
      } catch (error) {
        console.error(`Error importing command file ${file}:`, error);
      }
    }

    console.log({ commandsDir });
    console.log({ commandFiles });
    console.log({ commandData });

    // Initialize REST API client
    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_BOT_TOKEN!
    );

    // Register commands for the guild
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
      body: commandData,
    });

    console.log(`Successfully registered commands in guild: ${guildId}`);
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

export { registerGuildCommands };
