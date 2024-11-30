import { Guild } from "discord.js";
import { registerGuildCommands } from "../utils/registerCommands";
import ClientWithCommands from "../types/discord";
import { createGuildWithDefaultCommands } from "../db/guild";
export default {
  name: "guildCreate",
  async execute(guild: Guild, client: ClientWithCommands) {
    await registerGuildCommands(client, guild.id);
    await createGuildWithDefaultCommands({
      id: guild.id,
      name: guild.name,
      icon: guild.icon ?? undefined,
    });
    console.log(`Bot joined a new guild: ${guild.name} (ID: ${guild.id})`);
  },
};
