import dotenv from 'dotenv';

dotenv.config();

export const configENV = {
    token: process.env.disc_token!,
    clientId: process.env.id_client!,
    serverId: process.env.serverID!,
    openaiApiKey: process.env.OPENAI_API_KEY!,

    //redis
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisPassword: process.env.REDIS_PASSWORD,

    // Application Settings
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    
    // Health Check
    healthCheckPort: parseInt(process.env.HEALTH_CHECK_PORT || '3000'),

};

const requiredVars = ['token', 'clientId', 'serverId', 'openaiApiKey'];
for (const varName of requiredVars) {
    if (!configENV[varName as keyof typeof configENV]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
}