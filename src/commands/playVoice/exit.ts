import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, Client } from "discord.js"
import { Command } from "../../types";
import { CommandInteraction } from 'discord.js';

export let salir = new SlashCommandBuilder()
    .setName("salir")
    .setDescription("alamos");

export async function execute( {client, interaction}: { client: Client<boolean>, interaction: any} ) {

    await interaction.reply("Acaso quieres que me vaya? :(")

    const queue = client.player.nodes.get(interaction.guildId);

    if (queue && queue.connection){
        await queue.delete();  
    } 
        
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`está bien, entiendo que no eres tu, soy yo...\n`
                )
        ],
        ephemeral: false
    })

}
const exitCommand : Command = { data: salir, execute: execute };

export default exitCommand;