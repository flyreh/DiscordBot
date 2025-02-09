import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export let server = new SlashCommandBuilder()
    .setName("server")
    .setDescription("te respondo");

export async function execute({ client, interaction }: any) {
    interaction.reply("server?");
}

const serverCommand : Command = { data: server, execute: execute };

export default serverCommand;