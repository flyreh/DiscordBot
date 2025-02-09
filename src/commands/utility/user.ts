import { escapeCodeBlock, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export let user = new SlashCommandBuilder()
    .setName("usuario")
    .setDescription("te respondo");

export async function execute({ client, interaction }: any) {
    interaction.reply("usuario?");
}

const userCommand : Command = { data : user, execute: execute };
export default userCommand;