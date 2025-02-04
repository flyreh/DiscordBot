import dotenv from 'dotenv';
import { Client, Collection, CommandInteraction, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
} from '@discordjs/voice';

import path from 'path';
import { Player } from 'discord-player';
import { Command, commands } from "./types";

//requires
const { SoundCloudExtractor } = require("@discord-player/extractor");
const ytdl = require("discord-ytdl-core");
const { createWriteStream } = require("fs");

dotenv.config();
const token = process.env.disc_token!;
const clientId = process.env.id_client!;
const serverID = process.env.serverID!;


import * as fs from 'fs';

declare module "discord.js"
{
    interface Client<Ready extends boolean = boolean> {
        commands: Collection<string, Command>;
        player: Player;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});


player.extractors.register(SoundCloudExtractor, {});

client.player = player;

client.commands = new Collection<string, Command>;

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

    let commandsPath = path.join(foldersPath, folder);
    let commandFiles = fs.readdirSync(commandsPath).filter( (file: string) => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command: Command = require(filePath).default;
        
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            commands.push(command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
//console.log(commands);

client.once(Events.ClientReady, (readyClient: Client<true>) => {
    console.log(`Ready! Logged in as ${readyClient.user!.tag}`);


});

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data: any  = await rest.put(
            Routes.applicationGuildCommands(clientId, serverID),
            { body: commands.map(command => command.data.toJSON()) }
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  //  console.log(interaction);

    if (!interaction.isCommand()) return;

    //console.log(interaction.commandName);
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute({ client, interaction });
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command" });
    }

});

client.login(token);



