import { SlashCommandUserOption,SlashCommandSubcommandBuilder, SlashCommandBuilder, SlashCommandStringOption, GuildMember, User } from "discord.js";
import { EmbedBuilder, Client } from "discord.js"
import { Command, commands } from "../../types";
import { user } from "./user";

export let commandList = new SlashCommandBuilder()
    .setName("apodo")
    .setDescription("cambiale el nombre a alguien")
    .addUserOption((option : SlashCommandUserOption) =>
        option
            .setName("tag")
            .setDescription("Nombre de la persona a mutear")
            .setRequired(true)
    )
    .addStringOption((option: SlashCommandStringOption) =>
        option.setName("searchterms").setDescription("apodo").setRequired(true)
    )

export async function execute({ client, interaction }: {client : Client<boolean>, interaction: any} ) {

    //retorna User
    const userTag : User = interaction.options.getUser("tag");
    const apodo : string = interaction.options.getString("searchterms");
    
    if(!userTag){
        await interaction.reply({
            content: "No se encontró el usuario",
            ephemeral: false
        });
        return;
    }
    
    //retorna GuildMember
    const miembro : GuildMember = interaction.guild.members.cache.get(userTag.id);

    try {
        await miembro.setNickname(apodo);
        await interaction.reply({
            content: `El apodo de ${userTag.username} ha sido cambiado a ${apodo} dentro del servidor`,
            ephemeral: false
        });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "No tengo permisos para cambiar el apodo de este usuario.",
            ephemeral: false
        });
    }


}
const apodoCommand: Command = { data: commandList, execute: execute };

export default apodoCommand;