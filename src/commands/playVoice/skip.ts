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
         return await interaction.editReply({
            content: "No hay canciones para reproducir.",
            ephemeral: false
        });
    }

    console.log(queue.node.skip());
    await new Promise(resolve => setTimeout(resolve, 500));
    // Get the current song
    const currentSong =  queue.currentTrack;
    //console.log("CURRENT SONG", currentSong?.cleanTitle);
    
    if(!currentSong){ 
        return await interaction.editReply({
            content: "No hay más canciones en la cola, nos vemos...",
            ephemeral: false
        });
    }

    await interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Reproduciendo ahora\n` +
                    (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - pedido por : ${currentSong.requestedBy?.globalName ?? 'Unknown'}` : "None")
                )
                .setThumbnail(currentSong.thumbnail)
        ],
        ephemeral: false
    })

}

const skipCommand : Command = { data: siguiente, execute: execute };  

export default skipCommand;