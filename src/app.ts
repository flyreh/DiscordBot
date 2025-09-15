import { CreateClient } from "./config/client.config";
import { configENV } from "./config/enviroment.config";
import { CreatePlayer } from "./config/player.config";
import { loadCommands } from "./handlers/command.handler";
import { DeployCommands } from "./handlers/deployCommands.handler";
import { SetupEventHandlers } from "./handlers/event.handler";

async function main(): Promise<void> {
    
    try {

        const client = CreateClient();

        const player = CreatePlayer(client);

        loadCommands(client);

        DeployCommands();

        SetupEventHandlers(client);

        await client.login(configENV.token);
        
    } catch (error) {
        console.log('Error', error)
    }
}

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

main();




