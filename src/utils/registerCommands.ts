import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import ClientWithCommands from "../types/discord";
import { SlashCommandBuilder } from "@discordjs/builders";

function getCommandFiles(dir: string): string[] {
  const files = fs.readdirSync(dir);
  let commandFiles: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      commandFiles = commandFiles.concat(getCommandFiles(filePath));
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      commandFiles.push(filePath);
    }
  }

  return commandFiles;
}

async function loadCommands(client: ClientWithCommands, commandsDir: string) {
  // Use process.cwd() to get the base project directory
  const resolvedCommandsDir = path.join(process.cwd(), "dist", commandsDir);
  const commandFiles = getCommandFiles(resolvedCommandsDir);
  const loadedCommands = [];

  for (const file of commandFiles) {
    try {
      const commandModule = await import(file);

      for (const exportKey in commandModule) {
        const command = commandModule[exportKey];

        if (command?.data instanceof SlashCommandBuilder && command?.execute) {
          // Add to client's command collection
          client.commands.set(command.data.name, command);
          loadedCommands.push(command.data.toJSON());

          console.log(`Loaded command: ${command.data.name}`);
        }
      }
    } catch (error) {
      console.error(`Error importing command file ${file}:`, error);
    }
  }

  return loadedCommands;
}

// Register commands for a specific guild
async function registerGuildCommands(
  client: ClientWithCommands,
  guildId: string
) {
  if (!client.user) {
    throw new Error("Client is not logged in or user is not available.");
  }

  // Specify the path to your commands directory

  // Load commands
  const commandData = await loadCommands(client, "/commands");

  // Initialize REST API client
  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  try {
    // Register commands for the guild
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
      body: commandData,
    });

    console.log(
      `Successfully registered ${commandData.length} commands in guild: ${guildId}`
    );
  } catch (error) {
    console.error("Error registering commands:", error);
    throw error;
  }
}

export { loadCommands, registerGuildCommands };
