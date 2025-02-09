import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, Client } from "discord.js";
import { Command, commands } from "../../types";

export let commandList = new SlashCommandBuilder()
    .setName("command")
    .setDescription("muestra la lista de comandos");

export async function execute({ client, interaction }: { client: Client<boolean>, interaction: any }) {

    await interaction.reply({
        content: "Mostrando lista de comandos...",
        ephemeral: false    
    });

    // Construir la lista de comandos y subcomandos
    const commandDescriptions = commands.map(command => {
        const subcommands = command.data.options?.map(option => {
            if (option instanceof SlashCommandBuilder) { // Verificar si es un subcomando
                return `  - ${option.name}: ${option.description}`;
            }
            return null;
        }).filter(Boolean).join("\n");

        return `${command.data.name}: ${command.data.description}\n${subcommands}`;
    }).join("\n\n");

    await interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Lista de Comandos\n${commandDescriptions}`)
        ],
        ephemeral: false
    });
}

const queueCommand: Command = { data: commandList, execute: execute };

export default queueCommand;