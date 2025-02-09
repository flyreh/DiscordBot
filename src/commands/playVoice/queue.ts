import { Client, escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js"
import { Command } from "../../types";
import { deserialize, Track } from "discord-player";

export let cola = new SlashCommandBuilder()
    .setName("cola")
    .setDescription("mostrar la cola de reproducción")
    .addSubcommand((subcommand) => 
        subcommand
            .setName("mostrar")
            .setDescription("mostrar la cola de reproducción")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("eliminar")
            .setDescription("elimina una cancion de la cola")
            .addIntegerOption((option) =>
                option
                    .setName("indice")
                    .setDescription("indice de la cancion en la cola")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("limpiar")
            .setDescription("limpia la cola de reproducción")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("mover")
            .setDescription("mover una canción a un indice de la cola")
            .addIntegerOption((option) =>
                option
                    .setName("origen")
                    .setDescription("Indice cancion")
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName("destino")
                    .setDescription("destino")
                    .setRequired(true)
            )
    );

export async function execute({ client, interaction }: {client : Client<boolean>, interaction: any}) {

    const queue = client.player.nodes.get(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
        return await interaction.reply({
            content: "No haz puesto canciones en la cola.",
            ephemeral: false
        });
    }

    if(interaction.options.getSubcommand() === "mostrar"){

        await interaction.reply({
            content: "Mostrando cola de reproducción...",
            ephemeral: false
        });

        // Get the first 10 songs in the queue
        const queueString = queue.tracks.data.slice(0, 10).map((song: Track, i: number) => {
            return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy?.id ?? 'Unknown'}>`
        }).join("\n")

        // Get the current song
        const currentSong = queue.currentTrack;
        if(currentSong == null){
            return;
        }
        await interaction.followUp({
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
    else if(interaction.options.getSubcommand() === "eliminar") {
        
        const indice : number = interaction.options.getInteger("indice");

        console.log("INDICE", indice);

        await interaction.reply({
            content: "Eliminando canción de la cola...",
            ephemeral: false
        });


        if(indice < 0 || indice >= queue.getSize()){
            return await interaction.editReply({
                content: "Ingresa un indice válido para la cola",
                ephemeral: false
            });
        }

        try{
            const track = queue.tracks.data[indice];
            console.log("TRACK", track);
            queue.removeTrack(track);
            //espera para actualizacion
            await new Promise(resolve => setTimeout(resolve, 500));

            await interaction.followUp({
                content: `Canción eliminada: ${track.title}`,
                ephemeral: false
    
            });

        }catch(e){
            return await interaction.editReply({
                content: "No se pudo eliminar la canción",
                ephemeral: false
            });
        }

    }
    else if (interaction.options.getSubcommand() === "limpiar") {
        
        await interaction.reply({
            content: "Limpiando cola de reproducción...",
            ephemeral: false
        });
        try{
            queue.clear();
            await interaction.followUp({
                content: "Cola de reproducción limpiada",
                ephemeral: false
            });
        }catch(e){
            return await interaction.editReply({
                content: "No se pudo limpiar la cola :(",
                ephemeral: false
            });

        }
    }
    else if(interaction.options.getSubcommand()=== "mover"){

        const origen : number = interaction.options.getInteger("origen");
        const destino : number = interaction.options.getInteger("destino");

        await interaction.reply(
            {
                content : "moviendo canciones...",
                ephemeral : false
            }
        );
        if( (origen && destino <0) || (origen && destino) >= queue.getSize()) {
                
            return await interaction.editReply({
                content : "Ingrese indices válidos para la cola de reproducción",
                ephemeral : false
            });
        }
        try {

            if(origen == destino){
                return await interaction.editReply({
                    content : `el origen y el destino tienen el mismo valor`,
                    ephemeral : false
                });
            }
            else{
                const trackorigen = queue.tracks.data[origen];
                //principal XD
                queue.moveTrack(trackorigen, destino);
                
                await interaction.followUp({
                    content : `Canción ${trackorigen.cleanTitle} movida a la posición ${destino} de la cola`,
                    ephemeral : false
                });
            }

        } catch (error) {
            console.log("Error al mover las canciones",error);

            return interaction.editReply({
                content : "No se puedo mover las canciones de la cola =(",
                ephemeral : false
            });
            
        }

    }

}

const queueCommand: Command = { data: cola, execute: execute };

export default queueCommand;
