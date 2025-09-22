import { Message, Client } from 'discord.js';
import OpenAI from 'openai';
import { configENV } from '../config/enviroment.config';
import { RedisCacheService } from '../services/cache.services';

interface ContextMessage {
    content: string;
    isBot: boolean;
    timestamp: Date;
}

class OpenaiHandler{
    private openai: OpenAI;
    private CacheService : RedisCacheService;
    private readonly CONTEXT_TTL = 10000; // 2 horas
    private readonly MAX_CONTEXT_MESSAGES = 15;

    constructor(){
        this.openai = new OpenAI({
            apiKey: configENV.openaiApiKey,
        });
        this.CacheService = new RedisCacheService();
    }

    private getContextKey(channelId: string): string {
        //formato de la key en redis
        return `chat_context:${channelId}`;
    }

    public async addMessageToContext(channelId: string, content : string, isboot: boolean = false) : Promise<void> {
        try {
            const contextKey = this.getContextKey(channelId);
            let existingContext  = await this.CacheService.get<ContextMessage[]>(contextKey);
            if(!existingContext){
                existingContext = [];
            }
            existingContext ?.push({
                content: content,
                isBot: isboot,
                timestamp: new Date()
            } as ContextMessage);
            console.log('length context:', existingContext.length);
            if (existingContext.length >= this.MAX_CONTEXT_MESSAGES) {
                existingContext.splice(0, existingContext.length - this.MAX_CONTEXT_MESSAGES);
            }
            await this.CacheService.set(contextKey, existingContext, this.CONTEXT_TTL);

        } catch (error) {
            console.error('Error adding message to context:', error);
        }

    }

    private async getChannelContext(channelId: string): Promise<ContextMessage[]> {
        try {
            const contextKey = this.getContextKey(channelId);
            let ChannelContext =  await this.CacheService.get<ContextMessage[]>(contextKey);
            
            if(!ChannelContext){
                return [];
            }
            
            return ChannelContext;
        } catch (error) {
            console.error('Error getting channel context:', error);
            return [];
        }
    }
    private buildConversationHistory (channelContext : ContextMessage[]) : OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
         const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: "Eres un bot de Discord amigable y útil. Responde de manera conversacional y puedes mantener el contexto de la conversación. Sé conciso pero informativo."
            }
        ];

        channelContext.forEach( msg => {
                messages.push({
                    role: msg.isBot ? "assistant" : "user",
                    content: msg.content   
                });
        });

        return messages;
    }

    public async generateResponse(channelId: string, userMessage: string, message: Message): Promise<void>{
        try {
            const context = await this.getChannelContext(channelId);
            const messages = this.buildConversationHistory(context);

            messages.push({
                role: "user",
                content: userMessage
            });
            console.log("Mensajes enviados a OpenAI:", messages);
            const botMessage = await message.reply("Pensando...");
            const stream = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                stream: true,
            });
            let fullResponse = "";
            let isFirstChunk = true;

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    
                    if (isFirstChunk || fullResponse.length % 50 === 0) {
                        const truncatedResponse = this.truncateMessage(fullResponse, 1900);
                        await botMessage.edit(truncatedResponse);
                        isFirstChunk = false;
                    }
                }
            }
            if (fullResponse.trim()) {
                const finalResponse = this.truncateMessage(fullResponse, 1900);
                await botMessage.edit(finalResponse);
                
                await this.addMessageToContext(channelId, fullResponse, true);
            } else {
                await botMessage.edit("No pude generar una respuesta válida. Por favor intenta reformular tu pregunta.");
            }
            
        } catch (error) {
            console.error('Error generating OpenAI response:', error);
            
            let errorMessage = "Hubo un error al procesar tu mensaje.";
            
            if (error instanceof Error) {
                if (error.message.includes('rate limit')) {
                    errorMessage = "He excedido el límite de uso. Por favor espera un momento e intenta de nuevo.";
                } else if (error.message.includes('quota')) {
                    errorMessage = "API no disponible. Contacta al administrador.";
                }
            }
            await message.reply(errorMessage);
        }
    }

    private truncateMessage(text: string, maxLength: number = 1900): string {
        if (text.length <= maxLength) return text;
        
        const sentences = text.substring(0, maxLength).split(/[.!?]+/);
        if (sentences.length > 1) {
            sentences.pop();
            const truncated = sentences.join('.') + '.';
            return truncated + "\n\n*(Respuesta truncada por límite de caracteres)*";
        }
        
        const words = text.substring(0, maxLength).split(' ');
        words.pop();
        return words.join(' ') + "...\n\n*(Respuesta truncada por límite de caracteres)*";
    }

    isBotMentioned(message: Message, client: Client): boolean {
        return message.mentions.users.has(client.user!.id);
    }

    public async clearChannelContext(channelId: string): Promise<void> {
        try {
            const contextKey = this.getContextKey(channelId);
            await this.CacheService.delete(contextKey);
        } catch (error) {
            console.error('Error clearing channel context:', error);
        }
    }
}

export const openaiHanlder = new OpenaiHandler();


// // Función para agregar mensaje al contexto del canal
// export const addMessageToContext = (channelId: string, content: string, isBot: boolean = false): void => {
//     if (!channelContexts.has(channelId)) {
//         channelContexts.set(channelId, []);
//     }

//     const context = channelContexts.get(channelId)!;
//     const newMessage: ContextMessage = {
//         content: content,
//         isBot: isBot,
//         timestamp: new Date()
//     };

//     context.push(newMessage);

//     if (context.length > 7) {
//         context.shift();
//     }
// };

// const getChannelContext = (channelId: string): ContextMessage[] => {
//     return channelContexts.get(channelId) || [];
// };

// const buildConversationHistory = (channelContext: ContextMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
//     const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
//         {
//             role: "system",
//             content: "Eres un bot de Discord amigable y útil. Responde de manera conversacional y mantén el contexto de la conversación. Sé conciso pero informativo."
//         }
//     ];

//     channelContext.forEach(msg => {
//         messages.push({
//             role: msg.isBot ? "assistant" : "user",
//             content: msg.content
//         });
//     });

//     return messages;
// };

// interface StreamConfig {
//     model: string;
//     maxTokens: number;
//     temperature: number;
//     updateWordThreshold: number;
//     maxResponseLength: number;
// }

// const defaultStreamConfig: StreamConfig = {
//     model: "gpt-3.5-turbo",
//     maxTokens: 1000,
//     temperature: 0.7,
//     updateWordThreshold: 3,
//     maxResponseLength: 1900
// };

// const createThinkingIndicator = () => {
//     const indicators = ["Pensando", "Pensando.", "Pensando..", "Pensando..."];
//     let index = 0;
    
//     return {
//         next: () => {
//             const current = indicators[index];
//             index = (index + 1) % indicators.length;
//             return current;
//         },
//         generating: () => "Generando respuesta..."
//     };
// };
// const truncateMessage = (text: string, maxLength: number = 1900): string => {
//     if (text.length <= maxLength) return text;
    
//     // Intentar cortar en la última oración completa
//     const sentences = text.substring(0, maxLength).split(/[.!?]+/);
//     if (sentences.length > 1) {
//         sentences.pop(); // Remover la última oración incompleta
//         const truncated = sentences.join('.') + '.';
//         return truncated + "\n\n*(Respuesta truncada por límite de caracteres)*";
//     }
    
//     // Si no hay oraciones, cortar en la última palabra
//     const words = text.substring(0, maxLength).split(' ');
//     words.pop();
//     return words.join(' ') + "...\n\n*(Respuesta truncada por límite de caracteres)*";
// };

// const createMessageUpdater = (botMessage: Message) => {
//     let updateTimeout: NodeJS.Timeout | null = null;
//     let pendingUpdate: string | null = null;
    
//     return {
//         scheduleUpdate: (content: string, immediate: boolean = false) => {
//             pendingUpdate = content;
            
//             if (immediate) {
//                 if (updateTimeout) clearTimeout(updateTimeout);
//                 updateTimeout = null;
//                 return botMessage.edit(content);
//             }
            
//             if (!updateTimeout) {
//                 updateTimeout = setTimeout(async () => {
//                     if (pendingUpdate) {
//                         try {
//                             await botMessage.edit(pendingUpdate);
//                         } catch (error) {
//                             console.warn('Error al actualizar mensaje:', error);
//                         }
//                     }
//                     updateTimeout = null;
//                     pendingUpdate = null;
//                 }, 500);
//             }
//         },
        
//         finalUpdate: async (content: string) => {
//             if (updateTimeout) {
//                 clearTimeout(updateTimeout);
//                 updateTimeout = null;
//             }
//             try {
//                 await botMessage.edit(content);
//             } catch (error) {
//                 console.warn('Error en actualización final:', error);
//             }
//         }
//     };
// };
// export const generateOpenAIResponse = async (
//     channelId: string, 
//     userMessage: string, 
//     message: Message,
//     config: Partial<StreamConfig> = {}
// ): Promise<void> => {
//     const streamConfig = { ...defaultStreamConfig, ...config };
    
//     try {
//         const context = getChannelContext(channelId);

//         const messages = buildConversationHistory(context);
        
//         messages.push({
//             role: "user",
//             content: userMessage
//         });

//         const thinkingIndicator = createThinkingIndicator();
//         const botMessage = await message.reply(thinkingIndicator.next());
//         const updater = createMessageUpdater(botMessage);
        
//         const thinkingAnimation = setInterval(() => {
//             updater.scheduleUpdate(thinkingIndicator.next(), true);
//         }, 800);
        
//         await new Promise(resolve => setTimeout(resolve, 1500));
//         clearInterval(thinkingAnimation);
        
//         await updater.scheduleUpdate(thinkingIndicator.generating(), true);

//         const stream = await openai.chat.completions.create({
//             model: streamConfig.model,
//             messages: messages,
//             max_tokens: streamConfig.maxTokens,
//             temperature: streamConfig.temperature,
//             stream: true,
//         });

//         let fullResponse = "";
//         let wordBuffer = "";
//         let isFirstChunk = true;
        
//         for await (const chunk of stream) {
//             const content = chunk.choices[0]?.delta?.content || '';
//             if (content) {
//                 fullResponse += content;
//                 wordBuffer += content;
                
//                 if (isFirstChunk) {
//                     const truncatedResponse = truncateMessage(fullResponse, streamConfig.maxResponseLength);
//                     updater.scheduleUpdate(truncatedResponse, true);
//                     isFirstChunk = false;
//                     continue;
//                 }
                
//                 const wordCount = wordBuffer.split(/\s+/).length;
//                 if (wordCount >= streamConfig.updateWordThreshold || content.includes('\n')) {
//                     const truncatedResponse = truncateMessage(fullResponse, streamConfig.maxResponseLength);
//                     updater.scheduleUpdate(truncatedResponse);
//                     wordBuffer = "";
//                 }
//             }
//         }

//         if (fullResponse.trim()) {
//             const finalResponse = truncateMessage(fullResponse, streamConfig.maxResponseLength);
//             await updater.finalUpdate(finalResponse);
            
//             addMessageToContext(channelId, fullResponse, true);
//         } else {
//             await updater.finalUpdate("No pude generar una respuesta válida. Por favor intenta reformular tu pregunta.");
//         }

//     } catch (error) {
//         console.error('Error al generar respuesta con OpenAI:', error);
        
//         let errorMessage = "Hubo un error al procesar tu mensaje.";
        
//         if (error instanceof Error) {
//             if (error.message.includes('rate limit')) {
//                 errorMessage = "He excedido el límite de uso. Por favor espera un momento e intenta de nuevo.";
//             } else if (error.message.includes('insufficient_quota')) {
//                 errorMessage = "API no disponible. Contacta al administrador.";
//             } else if (error.message.includes('context_length_exceeded')) {
//                 errorMessage = "La conversación es muy larga. limpia el contexto.";
//             }
//         }
        
//         try {
//             await message.reply(errorMessage);
//         } catch (replyError) {
//             console.error('Error al enviar mensaje de error:', replyError);
//         }
//     }
// };

// export const isBotMentioned = (message: Message, client: Client): boolean => {
//     return message.mentions.users.has(client.user!.id);
// };

// export const clearChannelContext = (channelId: string): void => {
//     channelContexts.delete(channelId);
// };


// export const getChannelContextStats = (channelId: string): {
//     messageCount: number;
//     lastMessageTime?: Date;
//     totalCharacters: number;
// } => {
//     const context = channelContexts.get(channelId) || [];
    
//     const totalCharacters = context.reduce((total, msg) => total + msg.content.length, 0);
//     const lastMessage = context[context.length - 1];
    
//     return {
//         messageCount: context.length,
//         lastMessageTime: lastMessage?.timestamp,
//         totalCharacters: totalCharacters
//     };
// };