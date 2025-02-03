import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption } from "discord.js";
import { Client, EmbedBuilder } from "discord.js"
import { GuildQueue, QueryType, Track, useQueue } from "discord-player"
import { Command } from "../../types";

export let play = new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a song from YouTube.")
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
            subcommand
            .setName("busca")
            .setDescription("keyword")
            .addStringOption((option: SlashCommandStringOption) =>
                option.setName("searchterms").setDescription("search keywords").setRequired(true)
            )
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>

        subcommand
            .setName("list")
            .setDescription("Plays a playlist from YT")
            .addStringOption((option: SlashCommandStringOption) =>
                 option.setName("url").setDescription("the playlist's url").setRequired(true))
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
        subcommand
            .setName("cancion")
            .setDescription("URL Plays a single song from YT")
            .addStringOption((option: SlashCommandStringOption) =>
                 option.setName("url").setDescription("the song's url").setRequired(true))
    )

export async function execute({ client, interaction }: { client: Client<boolean>, interaction: any }): Promise<void> {

    await interaction.reply({
        content: `Realizando búqueda, te pido paciencia mi querido ${interaction.user.globalName}...`,
        ephemeral: false
    });

    if (!interaction.member.voice.channel) {

        return interaction.editReply({
            content: "Debes estar en un canal de voz para usar este comando.",
            ephemeral: false
        });
    }

    const queue = await client.player.nodes.create(interaction.guild);

    try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } 
      catch {
        queue.delete();
        return interaction.reply({ content: 'No pude unirme al canal de voz.', ephemeral: true });
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
            return interaction.editReply({
                content: "No se encontró la música que deseas",
                ephemeral: false
            });
        }
        const thumbnail = song.thumbnail ? song.thumbnail : null;
        const url = song.url ? song.url : undefined;
        embed
            .setDescription(`**[${song.title}](${url})** ha sido añadido a la cola :V.`)
            .setThumbnail(thumbnail)
            .setFooter({ text: `Duration: ${song.duration}` });

        QueueControl(queue, song, interaction, embed);

    } else if (interaction.options.getSubcommand() === "list") {
        const playlistURL = interaction.options.getString("url");
        const result = await client.player.search(playlistURL, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        });

        if (!result || result.tracks.length === 0) {
            return interaction.reply("No playlist found with the given URL.");
        }

        embed
            .setDescription(`**${result.tracks.length} tracks from [${result.playlist?.title ?? 'Unknown Playlist'}](${result.playlist?.url ?? '#'})** added to the queue.`)
            .setThumbnail(result.playlist?.thumbnail ?? '');

        //QueueControl(queue, song);

    } else if (interaction.options.getSubcommand() === "cancion") {

        const songURL = interaction.options.getString("nombre de la canción");
        console.log("SONG URL : ", songURL)
        const result = await client.player.search(songURL, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        });
        console.log("SONG ENCONTRADA : ", result)

        if (!result || result.tracks.length === 0) {
            return interaction.editReply("No song found with the given URL.");
        }

        const song = result.tracks[0];
        if (queue) {
            queue.addTrack(song);
        }

        embed
            .setDescription(`**[${song.title}](${song.url})** has been added to the queue.`)
            .setThumbnail(song.thumbnail)
            .setFooter({ text: `Duration: ${song.duration}` });

        QueueControl(queue, song, interaction, embed);
    }

    interaction.editReply({ embeds: [embed], ephemeral: false });
}

const QueueControl  = (queue : GuildQueue, track: Track, interaction: any, embed : EmbedBuilder ) => {

    if (queue && !queue.isPlaying()){
        queue.play(track);
    }else{
        queue.addTrack(track);
    }
}

const playCommand : Command = { data: play, execute: execute };

export default playCommand;
