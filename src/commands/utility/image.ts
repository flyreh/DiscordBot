import { EmbedBuilder, escapeCodeBlock, SlashCommandBuilder, Client } from "discord.js";
import { createClient } from 'pexels';
import { Command } from "../../types";

export let image = new SlashCommandBuilder()
    .setName("imagen")
    .setDescription("Envio de imágenes")
    .addSubcommand(subcommand =>
        subcommand
            .setName("busca")
            .setDescription("keyword")
            .addStringOption(option =>
                option.setName("searchterms").setDescription("search keywords").setRequired(true)
            )
    )

export async function execute({ client, interaction }: {client: Client<boolean>, interaction : any}): Promise<void> {

    const apiKey = process.env.pexels_apikey;
    if (!apiKey) {
        throw new Error("Pexels API key is not defined");
    }
    const PexelClient = createClient(apiKey);

    await interaction.reply({
        content: "Realizando búqueda, tenme paciencia...",
        flags: 0
    });

    const searchTerms = interaction.options.getString("searchterms");

    if (!searchTerms) {
        return interaction.editReply({
            content: "Debes ingresar un término de búsqueda.",
            flags: 0
        });
    }

    const response = PexelClient.photos.search({ query: searchTerms, per_page: 4, locale: 'es-ES' })
        .then((response => {
            if ('photos' in response) {
                if (response.photos.length === 0) {
                    return interaction.editReply({
                        content: 'No se encontró ninguna imagen con los términos de búsqueda proporcionados.',
                        flags: 0
                    });
                }

                const embeds = response.photos.map(photo => {
                    return new EmbedBuilder()
                        .setTitle(photo.photographer)
                        .setImage(photo.src.original)
                        .setURL(photo.url)
                        .setFooter({ text: `Photo by ${photo.photographer} on Pexels` });
                });

                interaction.editReply({ embeds: embeds, flags: 0 });
                interaction.followUp({ content: `${interaction.user.globalName} `, flags: 0 });
            } else {
                return interaction.editReply({
                    content: 'Ocurrió un error al buscar imágenes.',
                    flags: 0
                });
            }
        }));


}

const imageCommand : Command = { data: image, execute: execute };

export default imageCommand;
