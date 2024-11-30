import { Guild } from "discord.js";
import { Interaction } from "discord.js";
import { deleteGuildWithAllRelatedRecords } from "../db/guild";
export default {
  name: "guildDelete",
  async execute(interaction: Interaction, guild: Guild) {
    console.log(`The bot was removed from: ${guild.name} (ID: ${guild.id})`);
    await deleteGuildWithAllRelatedRecords(guild.id);
  },
};
