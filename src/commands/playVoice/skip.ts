import { ClientEvents, escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, Client } from "discord.js"
import { Command } from "../../types";

export let siguiente = new SlashCommandBuilder()
    .setName("siguiente")
    .setDescription("Saltar a la siguiente canción");

export async function execute({ client, interaction }: {client: Client<boolean>, interaction : any} )  {
    const queue = client.player.nodes.get(interaction.guildId);

    await interaction.reply({
        content: "Pasando a la siguiente canción...",
        ephemeral: false
    });

    if (!queue || !queue.isPlaying()) {
        await interaction.editReply({
            content: "No hay canciones en la cola.",
            ephemeral: false
        });
        return;
    }

    queue.node.skip();
    // Get the current song
    const currentSong = queue.currentTrack;
    if(currentSong == null) {
        return;
    }

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Canción saltada\n` +
                    (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - pedido por : ${currentSong.requestedBy?.globalName ?? 'Unknown'}` : "None")
                )
                .setThumbnail(currentSong.thumbnail)
        ],
        ephemeral: false
    })

}

const skipCommand : Command = { data: siguiente, execute: execute };  

export default skipCommand;