import { Guild } from "discord.js";
import ClientWithCommands from "../types/discord";
import { Interaction } from "discord.js";

module.exports = {
  name: "guildDelete",
  execute(interaction: Interaction, guild: Guild) {
    console.log(`The bot was removed from: ${guild.name} (ID: ${guild.id})`);
    // Perform any cleanup operations, such as removing the server's data from your database
    // Example:
    // await prisma.guild.delete({ where: { id: guild.id } });
  },
};
