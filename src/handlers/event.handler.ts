import { Client, Events, Message } from "discord.js";
import { addMessageToContext, generateOpenAIResponse, isBotMentioned } from "./openai.handler";

export const SetupEventHandlers = (client: Client): void => {
    client.once(Events.ClientReady, (readyClient: Client<true>) => {
        console.log(`Ready! Logged in as ${readyClient.user!.tag}`);
    });

    // Manejador de comandos slash (existente)
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return;

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

    client.on(Events.MessageCreate, async (message: Message) => {
        
        if (message.author.bot) return;
        
        if (!message.content) return;
        
        if (message.content.startsWith('/')) return;

        try {
            const channelId = message.channel.id;
            const messageContent = message.content;

            addMessageToContext(channelId, messageContent, false);

            const mentioned = isBotMentioned(message, client);

            if (mentioned) {
                const cleanMessage = messageContent.replace(/<@!?\d+>/g, '').trim();
                
                await generateOpenAIResponse(channelId, cleanMessage || messageContent, message);
            }

        } catch (error) {
            console.error('Error al procesar mensaje con OpenAI:', error);
            
            if (isBotMentioned(message, client)) {
                try {
                    await message.reply('Lo siento, hubo un error al procesar tu mensaje.');
                } catch (replyError) {
                    console.error('Error al enviar mensaje de error:', replyError);
                }
            }
        }
    });

    // Listeners de player (existentes)
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
};