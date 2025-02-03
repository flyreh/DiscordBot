import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, Client } from "discord.js"
import { Command, commands } from "../../types";

export let commandList = new SlashCommandBuilder()
    .setName("command")
    .setDescription("muestra la lista de comandos");

export async function execute({ client, interaction }: {client : Client<boolean>, interaction: any} ) {

    await interaction.reply({
        content: "Mostrando lista de comandos...",
        ephemeral: false    
    });

    await interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Lista de Comandos\n` + commands.map( command => command.data.name).join("\n") )
        ],
        ephemeral: false
    })
}
const queueCommand: Command = { data: commandList, execute: execute };

export default queueCommand;