import { Guild, Client } from "discord.js";

export default {
  name: "guildCreate",
  execute(guild: Guild, client: Client) {
    console.log(`Bot joined a new guild: ${guild.name} (ID: ${guild.id})`);
  },
};
