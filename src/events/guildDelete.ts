import { Guild } from "discord.js";
import { deleteGuildWithAllRelatedRecords } from "../db/guild";
import ClientWithCommands from "../types/discord";
export default {
  name: "guildDelete",
  async execute(guild: Guild, client: ClientWithCommands) {
    console.log(`The bot was removed from: ${guild.name} (ID: ${guild.id})`);
    await deleteGuildWithAllRelatedRecords(guild.id);
  },
};
