import { Message, Client } from 'discord.js';
import OpenAI from 'openai';
import { configENV } from '../config/enviroment.config';

interface ContextMessage {
    content: string;
    isBot: boolean;
    timestamp: Date;
}

const channelContexts = new Map<string, ContextMessage[]>();

const openai = new OpenAI({
    apiKey: configENV.openaiApiKey,
});

// Función para agregar mensaje al contexto del canal
export const addMessageToContext = (channelId: string, content: string, isBot: boolean = false): void => {
    if (!channelContexts.has(channelId)) {
        channelContexts.set(channelId, []);
    }

    const context = channelContexts.get(channelId)!;
    const newMessage: ContextMessage = {
        content: content,
        isBot: isBot,
        timestamp: new Date()
    };

    context.push(newMessage);

    if (context.length > 7) {
        context.shift();
    }
};

const getChannelContext = (channelId: string): ContextMessage[] => {
    return channelContexts.get(channelId) || [];
};

const buildConversationHistory = (channelContext: ContextMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "Eres un bot de Discord amigable y útil. Responde de manera conversacional y mantén el contexto de la conversación. Sé conciso pero informativo."
        }
    ];

    channelContext.forEach(msg => {
        messages.push({
            role: msg.isBot ? "assistant" : "user",
            content: msg.content
        });
    });

    return messages;
};

interface StreamConfig {
    model: string;
    maxTokens: number;
    temperature: number;
    updateWordThreshold: number;
    maxResponseLength: number;
}

const defaultStreamConfig: StreamConfig = {
    model: "gpt-3.5-turbo",
    maxTokens: 1000,
    temperature: 0.7,
    updateWordThreshold: 3,
    maxResponseLength: 1900
};

const createThinkingIndicator = () => {
    const indicators = ["Pensando", "Pensando.", "Pensando..", "Pensando..."];
    let index = 0;
    
    return {
        next: () => {
            const current = indicators[index];
            index = (index + 1) % indicators.length;
            return current;
        },
        generating: () => "Generando respuesta..."
    };
};
const truncateMessage = (text: string, maxLength: number = 1900): string => {
    if (text.length <= maxLength) return text;
    
    // Intentar cortar en la última oración completa
    const sentences = text.substring(0, maxLength).split(/[.!?]+/);
    if (sentences.length > 1) {
        sentences.pop(); // Remover la última oración incompleta
        const truncated = sentences.join('.') + '.';
        return truncated + "\n\n*(Respuesta truncada por límite de caracteres)*";
    }
    
    // Si no hay oraciones, cortar en la última palabra
    const words = text.substring(0, maxLength).split(' ');
    words.pop();
    return words.join(' ') + "...\n\n*(Respuesta truncada por límite de caracteres)*";
};

const createMessageUpdater = (botMessage: Message) => {
    let updateTimeout: NodeJS.Timeout | null = null;
    let pendingUpdate: string | null = null;
    
    return {
        scheduleUpdate: (content: string, immediate: boolean = false) => {
            pendingUpdate = content;
            
            if (immediate) {
                if (updateTimeout) clearTimeout(updateTimeout);
                updateTimeout = null;
                return botMessage.edit(content);
            }
            
            if (!updateTimeout) {
                updateTimeout = setTimeout(async () => {
                    if (pendingUpdate) {
                        try {
                            await botMessage.edit(pendingUpdate);
                        } catch (error) {
                            console.warn('Error al actualizar mensaje:', error);
                        }
                    }
                    updateTimeout = null;
                    pendingUpdate = null;
                }, 500);
            }
        },
        
        finalUpdate: async (content: string) => {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
                updateTimeout = null;
            }
            try {
                await botMessage.edit(content);
            } catch (error) {
                console.warn('Error en actualización final:', error);
            }
        }
    };
};
export const generateOpenAIResponse = async (
    channelId: string, 
    userMessage: string, 
    message: Message,
    config: Partial<StreamConfig> = {}
): Promise<void> => {
    const streamConfig = { ...defaultStreamConfig, ...config };
    
    try {
        const context = getChannelContext(channelId);

        const messages = buildConversationHistory(context);
        
        messages.push({
            role: "user",
            content: userMessage
        });

        const thinkingIndicator = createThinkingIndicator();
        const botMessage = await message.reply(thinkingIndicator.next());
        const updater = createMessageUpdater(botMessage);
        
        const thinkingAnimation = setInterval(() => {
            updater.scheduleUpdate(thinkingIndicator.next(), true);
        }, 800);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        clearInterval(thinkingAnimation);
        
        await updater.scheduleUpdate(thinkingIndicator.generating(), true);

        const stream = await openai.chat.completions.create({
            model: streamConfig.model,
            messages: messages,
            max_tokens: streamConfig.maxTokens,
            temperature: streamConfig.temperature,
            stream: true,
        });

        let fullResponse = "";
        let wordBuffer = "";
        let isFirstChunk = true;
        
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                wordBuffer += content;
                
                if (isFirstChunk) {
                    const truncatedResponse = truncateMessage(fullResponse, streamConfig.maxResponseLength);
                    updater.scheduleUpdate(truncatedResponse, true);
                    isFirstChunk = false;
                    continue;
                }
                
                const wordCount = wordBuffer.split(/\s+/).length;
                if (wordCount >= streamConfig.updateWordThreshold || content.includes('\n')) {
                    const truncatedResponse = truncateMessage(fullResponse, streamConfig.maxResponseLength);
                    updater.scheduleUpdate(truncatedResponse);
                    wordBuffer = "";
                }
            }
        }

        if (fullResponse.trim()) {
            const finalResponse = truncateMessage(fullResponse, streamConfig.maxResponseLength);
            await updater.finalUpdate(finalResponse);
            
            addMessageToContext(channelId, fullResponse, true);
        } else {
            await updater.finalUpdate("No pude generar una respuesta válida. Por favor intenta reformular tu pregunta.");
        }

    } catch (error) {
        console.error('Error al generar respuesta con OpenAI:', error);
        
        let errorMessage = "Hubo un error al procesar tu mensaje.";
        
        if (error instanceof Error) {
            if (error.message.includes('rate limit')) {
                errorMessage = "He excedido el límite de uso. Por favor espera un momento e intenta de nuevo.";
            } else if (error.message.includes('insufficient_quota')) {
                errorMessage = "API no disponible. Contacta al administrador.";
            } else if (error.message.includes('context_length_exceeded')) {
                errorMessage = "La conversación es muy larga. limpia el contexto.";
            }
        }
        
        try {
            await message.reply(errorMessage);
        } catch (replyError) {
            console.error('Error al enviar mensaje de error:', replyError);
        }
    }
};

export const isBotMentioned = (message: Message, client: Client): boolean => {
    return message.mentions.users.has(client.user!.id);
};

export const clearChannelContext = (channelId: string): void => {
    channelContexts.delete(channelId);
};


export const getChannelContextStats = (channelId: string): {
    messageCount: number;
    lastMessageTime?: Date;
    totalCharacters: number;
} => {
    const context = channelContexts.get(channelId) || [];
    
    const totalCharacters = context.reduce((total, msg) => total + msg.content.length, 0);
    const lastMessage = context[context.length - 1];
    
    return {
        messageCount: context.length,
        lastMessageTime: lastMessage?.timestamp,
        totalCharacters: totalCharacters
    };
};