import { Client, escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js"
import { Command } from "../../types";
import { Track } from "discord-player";

export let cola = new SlashCommandBuilder()
    .setName("cola")
    .setDescription("mostrar la cola de reproducción");

export async function execute({ client, interaction }: {client : Client<boolean>, interaction: any}) {
    const queue = client.player.nodes.get(interaction.guildId);

    await interaction.reply({
        content: "Mostrando cola de reproducción...",
        ephemeral: false
    });

    if (!queue || !queue.isPlaying()) {
        await interaction.editReply({
            content: "No haz puesto canciones en la cola.",
            ephemeral: false
        });
        return;
    }

    // Get the first 10 songs in the queue
    const queueString = queue.tracks.data.slice(0, 5).map((song: Track, i: number) => {
        return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy?.id ?? 'Unknown'}>`
    }).join("\n")

    // Get the current song
    const currentSong = queue.currentTrack;
    if(currentSong == null){
        return;
    }
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`**Reproduciendo...**\n` +
                    (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy?.id ?? 'Unknown'}>` : "None") +
                    `\n\n**En cola...**\n${queueString}`
                )
                .setThumbnail(currentSong.thumbnail)
        ],
        ephemeral: false
    })

}

const queueCommand: Command = { data: cola, execute: execute };

export default queueCommand;