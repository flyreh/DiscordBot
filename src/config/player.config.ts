import { Player } from 'discord-player';
import { Client } from 'discord.js';
import { YoutubeiExtractor } from "discord-player-youtubei"

export const CreatePlayer = (client: Client) => {

    const player = new Player(client, {
    skipFFmpeg: false,

    });
    
    player.extractors.register(YoutubeiExtractor, {
    });

    client.player = player;

    return player;
}