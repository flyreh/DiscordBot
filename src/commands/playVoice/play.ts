import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, flatten } from "discord.js";
import { Client, EmbedBuilder } from "discord.js"
import { GuildQueue, QueryType, Track, useQueue } from "discord-player"
import { Command } from "../../types";

export let play = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce una cancion de YouTube con el nombre o la URL =)")
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
            .setName("busca")
            .setDescription("busca una cancion de YouTube")
            .addStringOption((option: SlashCommandStringOption) =>
                option.setName("searchterms").setDescription("nombre o URL").setRequired(true)
            )
    )

export async function execute({ client, interaction }: { client: Client<boolean>, interaction: any }): Promise<void> {

    await interaction.reply({
        content: `Realizando búqueda, te pido paciencia mi querido ${interaction.user.globalName}...`,
        flags: 0
    });

    if (!interaction.member.voice.channel) {

        return interaction.editReply({
            content: "Debes estar en un canal de voz para usar este comando.",
            flags: 0
        });
    }

    const queue = await client.player.nodes.create(interaction.guild);

    try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } 
      catch {
        queue.delete();
        return interaction.reply({ content: 'No pude unirme al canal de voz.', flags: 1 });
      }

    const embed = new EmbedBuilder();
    
    if (interaction.options.getSubcommand() === "busca") {

        const searchTerms = interaction.options.getString("searchterms");
        const result = await client.player.search(searchTerms, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });

        const song = result.tracks[0];

        if (!result || result.tracks.length === 0) {
            interaction.editReply({
                content: "No se encontró la música que deseas",
                flags: 0
            });
            return;
        }
        const thumbnail = song.thumbnail ? song.thumbnail : null;
        const url = song.url ? song.url : undefined;
        embed
            .setDescription(`**[${song.title}](${url})** ha sido añadido a la cola.`)
            .setThumbnail(thumbnail)
            .setFooter({ text: `Duration: ${song.duration}` });

        QueueControl(queue, song, interaction, embed);

     } 
     //else if (interaction.options.getSubcommand() === "cancion") {

    //     const songURL = interaction.options.getString("nombre de la canción");
    //     console.log("SONG URL : ", songURL)
    //     const result = await client.player.search(songURL, {
    //         requestedBy: interaction.user,
    //         searchEngine: QueryType.AUTO
    //     });
    //     console.log("SONG ENCONTRADA : ", result)

    //     if (!result || result.tracks.length === 0) {
    //         return interaction.editReply("No song found with the given URL.");
    //     }

    //     const song = result.tracks[0];
    //     if (queue) {
    //         queue.addTrack(song);
    //     }

    //     embed
    //         .setDescription(`**[${song.title}](${song.url})** has been added to the queue.`)
    //         .setThumbnail(song.thumbnail)
    //         .setFooter({ text: `Duration: ${song.duration}` });

    //     QueueControl(queue, song, interaction, embed);
    // }

    interaction.editReply({ embeds: [embed], flags: 0 });
}

const QueueControl  = async (queue : GuildQueue, track: Track, interaction: any, embed : EmbedBuilder ) => {

    try {
        if (queue && !queue.isPlaying()){
            await queue.play(track);
        }else{
            queue.addTrack(track);
        }
        console.log("QUEUE CONTROL : ", queue.getSize());
    } catch (error) {
        throw error;
    }
}

const playCommand : Command = { data: play, execute: execute };

export default playCommand;
