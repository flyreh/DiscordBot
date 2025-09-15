import dotenv from 'dotenv';

dotenv.config();

export const configENV = {
    token: process.env.disc_token!,
    clientId: process.env.id_client!,
    serverId: process.env.serverID!,
};

if (!configENV.token || !configENV.clientId || !configENV.serverId) {
    throw new Error('Missing required environment variables');
}