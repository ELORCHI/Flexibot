import { Client, Collection, ApplicationCommand, ClientOptions } from 'discord.js';

export default class ClientCommands extends Client {
    public commands: Collection<string, ApplicationCommand>;

    constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection<string, ApplicationCommand>();
    }
}