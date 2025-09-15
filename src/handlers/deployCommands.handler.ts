import { Client, Collection, CommandInteraction, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Command, commands } from "../types";
import { configENV } from '../config/enviroment.config';

export const DeployCommands = (): void =>{

    const rest = new REST().setToken(configENV.token);
    
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
            const commandsData = commands.map( (command: Command) => command.data.toJSON());
            // The put method is used to fully refresh all commands in the guild with the current set
            const data: any  = await rest.put(
                Routes.applicationGuildCommands(configENV.clientId, configENV.serverId),
                { body: commandsData }
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
    
}