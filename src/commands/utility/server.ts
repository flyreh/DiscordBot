import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export let server = new SlashCommandBuilder()
    .setName("server")
    .setDescription("te respondo desde server p q c chhc");

export async function execute({ client, interaction }: any) {
    interaction.reply("calla tarao ");
}

const serverCommand : Command = { data: server, execute: execute };

export default serverCommand;