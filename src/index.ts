import dotenv from "dotenv";
import express from "express";
import ClientWithCommands from "./types/discord";
import { setupAuthRoutes } from "./auth/auth";
import registerEvets from "./events/registerEvents";
import { loadCommands } from "./utils/registerCommands";
dotenv.config();
console.log(process.env.DATABASE_URL);
const client = new ClientWithCommands({
  intents: [
    // Replace with your required intents
    "Guilds",
    "GuildMessages",
    "MessageContent",
  ],
});

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize authentication routes
setupAuthRoutes(app);

// Discord client login
client.once("ready", async () => {
  console.log(`Bot logged in as ${client.user?.tag}`);
  registerEvets(client);
  await loadCommands(client, "/commands");
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
