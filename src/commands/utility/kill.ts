import { SlashCommandUserOption, SlashCommandBuilder, SlashCommandStringOption, GuildMember, User } from "discord.js";
import { EmbedBuilder, Client } from "discord.js"
import { Command, commands } from "../../types";
import { user } from "./user";

export let commandList = new SlashCommandBuilder()
    .setName("kill")
    .setDescription("killea a alguien")
    .addUserOption((option : SlashCommandUserOption) =>
        option
            .setName("tag")
            .setDescription("Nombre de la persona a matar")
            .setRequired(true)
    )

export async function execute({ client, interaction }: {client : Client<boolean>, interaction: any} ) {

    //retorna User
    const userTag : User = interaction.options.getUser("tag");
    
    if(!userTag){
        await interaction.reply({
            content: "No se encontró el usuario",
            ephemeral: false
        });
        return;
    }
    
    //retorna GuildMember
    const miembro : GuildMember = interaction.guild.members.cache.get(userTag.id);

    if (miembro.voice.channel === null) {
        await interaction.reply({
            content: `El usuario ${userTag} no está en un canal de voz`,
            ephemeral: false    
        });
        return;
    }
    
    if(userTag.id === interaction.user.id){
        await interaction.reply({
            content: "No puedes matarte a ti mismo 😄",
            ephemeral: false
        });
        return;
    } 
    else if(userTag.id === client.user!.id){
        await interaction.reply({
            content: "No puedes matar al bot 😄",
            ephemeral: false
        });
        return;
    }

   // console.log(client.user);

    miembro.voice.disconnect();

    const urlImage = `https://i.imgur.com/5ykiREv.jpeg`

    const embeds =  new EmbedBuilder()
            .setImage(urlImage)
            .setFooter({ text: `fotito` });
   
    await interaction.reply({
        content: `matando a... ${userTag}`,
        ephemeral: false    
    });

    interaction.editReply({ embeds: [embeds], ephemeral: false });
}
const queueCommand: Command = { data: commandList, execute: execute };

export default queueCommand;