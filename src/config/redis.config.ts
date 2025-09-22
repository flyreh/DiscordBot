import Redis from 'ioredis';
import { configENV } from './enviroment.config';

export class RedisConfig {
    //implementaremos el patron singleton para la instancia de la clase 

    private static instance: Redis | null = null;

    public static getInstance(): Redis {

        if (!this.instance) {

            this.instance = new Redis({
                host: configENV.redisHost,
                port: configENV.redisPort,
                password: configENV.redisPassword,
                maxRetriesPerRequest: 3,
                connectTimeout: 5000,
                lazyConnect: true,
                keepAlive: 30000,
            });

            this.instance.on('connect', () => {
                console.log('Redis connected');
            } );

            this.instance.on('error', (err) => {
                console.log('Redis error', err);
            });

            this.instance.on('reconnecting', () => {
                console.log('Redis reconnecting...');
            });
        }

        return this.instance;

    }
    public static async disconnect(): Promise<void>{
        if(this.instance){
            await this.instance.quit();
            this.instance = null;
        }
    }

    public static async HealthCheck(): Promise<boolean>{

        try {
            const client = this.getInstance();
            await client.ping();
            return true;
            
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }
}