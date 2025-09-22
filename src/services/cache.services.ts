import { RedisConfig } from "../config/redis.config";

import type Redis from "ioredis";

export interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    increment(key: string, value?: number): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
}

export class RedisCacheService implements CacheService {

    private redis: Redis;

    constructor(){

        this.redis = RedisConfig.getInstance();
    }

    async get<T>(key: string): Promise<T | null> {

        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) as T : null;
        } catch (error) {
            console.error('Error getting cache key:', error);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {

        try {
            const ValueSerialized = JSON.stringify(value);
            if(ttlSeconds){
                await this.redis.setex(key, ttlSeconds, ValueSerialized);
            }else{
                await this.redis.set(key, ValueSerialized);
            }
        } catch (error) {
            console.error('Error setting cache key:', error);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            throw error;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Error checking existence of key ${key}:`, error);
            return false;
        }
    }

    async increment(key: string, value: number): Promise<number> {
        try {
            return await this.redis.incrby(key, value);
        } catch (error) {
            console.error(`Error incrementing key ${key}:`, error);
            throw error;
        }
    }

    async expire(key: string, seconds: number): Promise<void> {
        try {
            await this.redis.expire(key, seconds);
        } catch (error) {
            console.error(`Error setting expiration for key ${key}:`, error);
        }
    }

    async clearPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error(`Error clearing pattern ${pattern}:`, error);
        }
    }
}