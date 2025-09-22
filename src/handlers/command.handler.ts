import { Client } from "discord.js";
import * as path from 'path';
import * as fs from 'fs'
import { Command, commands } from "../types";


export const loadCommands = (client: Client):void => {

    const foldersPath = path.join(path.dirname(__dirname), 'commands');
    const commandFolders = fs.readdirSync(foldersPath);
    
    for (const folder of commandFolders) {
    
        let commandsPath = path.join(foldersPath, folder);

        const currentFileExt = path.extname(__filename);
        let commandFiles = fs.readdirSync(commandsPath).filter((file: string) => 
            file.endsWith(currentFileExt)
        );   
    
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);

            try {
                const command: Command = require(filePath).default;
                
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ("data" in command && "execute" in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }    
            } catch (error) {
                throw error;
            }
            
        }
    }


}