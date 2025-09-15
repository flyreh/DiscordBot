import { Client, Events } from "discord.js";


export const SetupEventHandlers = (client: Client): void =>{
    client.once(Events.ClientReady, (readyClient: Client<true>) => {
    console.log(`Ready! Logged in as ${readyClient.user!.tag}`);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      //  console.log(interaction);
    
        if (!interaction.isCommand()) return;
    
        //console.log(interaction.commandName);
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute({ client, interaction });
            return;
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: "Hubo un error ejecutando este comando" });
        }
    
    });
    
    //listeners de player
    
    client.player.events.on('error', (queue, error) => {
        console.log(`Error general: ${error.message}`);
    });
    
    client.player.events.on('playerError', (queue, error) => {
        console.log(`Error del reproductor: ${error.message}`);
    });
    
    
    
    client.on('error', (error) => {
        console.error('Error del cliente:', error);
    });
    
    client.on('playerError', (queue, error) => {
        console.error(`Error en la cola de reproducción: ${error.message}`);
    });


}