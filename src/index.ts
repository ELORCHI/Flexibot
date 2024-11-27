import dotenv from "dotenv";
import express from "express";
import ClientCommands from "./types/discord";
import { setupAuthRoutes } from "./auth/auth";

import bodyParser from "body-parser";

dotenv.config();

const client = new ClientCommands({
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
client.once("ready", () => {
  console.log(`Bot logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
