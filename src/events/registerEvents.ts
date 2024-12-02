import fs from "fs";
import path from "path";
import ClientWithCommands from "../types/discord";
const eventsPath = __dirname;
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter(
    (file) =>
      file.endsWith(".ts") ||
      (file.endsWith(".js") && file != "registerEvents.ts")
  );

export default function registerEvets(client: ClientWithCommands) {
  for (const file of eventFiles) {
    console.log({ file });
    const event = require(path.join(eventsPath, file)).default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}
