import { Guild } from "discord.js";
import { registerGuildCommands } from "../utils/registerCommands";
import ClientWithCommands from "../types/discord";
import { prisma } from "../db/prismaClient";

export default {
  name: "guildCreate",
  async execute(guild: Guild, client: ClientWithCommands) {
    await registerGuildCommands(client, guild.id);
    console.log(`Bot joined a new guild: ${guild.name} (ID: ${guild.id})`);
  },
};
