import { SlashCommandUserOption, SlashCommandBuilder, SlashCommandStringOption, GuildMember, User } from "discord.js";
import { EmbedBuilder, Client } from "discord.js"
import { Command, commands } from "../../types";
import { user } from "./user";

export let commandList = new SlashCommandBuilder()
    .setName("mute")
    .setDescription("mutea a alguien")
    .addUserOption((option : SlashCommandUserOption) =>
        option
            .setName("tag")
            .setDescription("Nombre de la persona a mutear")
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
     
   // console.log(client.user);

    if (miembro.voice.channel === null) {
        await interaction.reply({
            content: `El usuario ${userTag} no está en un canal de voz`,
            ephemeral: false    
        });
        return;
    }

    await interaction.reply({
        content: `usuario ${userTag} muteado, jaja que risa`,
        ephemeral: false    
    });

    miembro.voice.setMute();

    const urlImage = `https://i.imgur.com/FqvIWVS.png`

    const embeds =  new EmbedBuilder()
            .setImage(urlImage)
            .setFooter({ text: `Vamos cerrando el ortito` });
   

    interaction.editReply({ embeds: [embeds], ephemeral: false });

}
const queueCommand: Command = { data: commandList, execute: execute };

export default queueCommand;