import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export let user = new SlashCommandBuilder()
    .setName("usuario")
    .setDescription("te respondo desde usuario p q c chhc");

export async function execute({ client, interaction }: any) {
    interaction.reply("calla tarao ");
}

const userCommand : Command = { data : user, execute: execute };
export default userCommand;