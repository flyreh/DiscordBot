import { Client, Collection, CommandInteraction, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Player } from 'discord-player';
import { Command } from "../types";

declare module "discord.js"
{
    interface Client<Ready extends boolean = boolean> {
        commands: Collection<string, Command>;
        player: Player;
    }
}


export const CreateClient = (): Client => {

    const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});
    client.commands = new Collection<string, Command>;

    return client;
}