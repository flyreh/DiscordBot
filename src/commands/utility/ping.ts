import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export let ping = new SlashCommandBuilder()
    .setName("hola")
    .setDescription("Te saludo");

export async function execute({ client, interaction }: any) {
    interaction.reply("Hola, espero que tengas un buen día");
}

const pingCommand : Command = { data: ping, execute: execute };

export default pingCommand;
