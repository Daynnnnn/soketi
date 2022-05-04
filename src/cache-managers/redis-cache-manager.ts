import { CacheManagerInterface } from './cache-manager-interface';
import { Server } from '../server';

const Redis = require('ioredis');

export class RedisCacheManager implements CacheManagerInterface {
    /**
     * The cache storage as in-memory.
     */
    protected redis: typeof Redis;;

    /**
     * Create a new memory cache instance.
     */
     constructor(protected server: Server) {
        let redisOptions = {
            maxRetriesPerRequest: 2,
            retryStrategy: times => times * 2,
            ...this.server.options.database.redis,
        };

        this.redis = new Redis({ ...redisOptions });
    }

    /**
     * Check if the given key exists in cache.
     */
    has(key: string): Promise<boolean> {
        return this.redis.exists(key);
    }

    /**
     * Get a key from the cache.
     * Returns false-returning value if cache does not exist.
     */
    get(key: string): Promise<any> {
        return this.redis.get(key);
    }

    /**
     * Set or overwrite the value in the cache.
     */
    set(key: string, value: any, ttlSeconds = -1): Promise<any> {
        if (ttlSeconds == -1) {
            return this.redis.set(key, value).then(() => {
                return Promise.resolve(true);
            });
        } else {
            return this.redis.set(key, value, 'EX', ttlSeconds).then(() => {
                return Promise.resolve(true);
            });
        }
    }

    /**
     * Disconnect the manager's made connections.
     */
    disconnect(): Promise<void> {
        this.redis.disconnect();

        return Promise.resolve();
    }
}
