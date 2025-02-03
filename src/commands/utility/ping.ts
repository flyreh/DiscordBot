import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export let ping = new SlashCommandBuilder()
    .setName("hola")
    .setDescription("Te respondo :v");

export async function execute({ client, interaction }: any) {
    interaction.reply("Gracias por haberme creado, te amo te quiero");
}

const pingCommand : Command = { data: ping, execute: execute };

export default pingCommand;
