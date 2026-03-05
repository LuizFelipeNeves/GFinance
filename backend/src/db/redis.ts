import Redis from 'ioredis';

let _redis: Redis | null = null;

const createRedis = (): Redis => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');

    return new Redis({
        host,
        port,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: (times) => {
            if (times > 3) {
                console.error('Redis connection failed');
                return null;
            }
            return Math.min(times * 100, 3000);
        }
    });
};

export const getRedis = (): Redis => {
    if (!_redis) {
        _redis = createRedis();

        _redis.on('connect', () => {
            console.log('Redis connected');
        });

        _redis.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }
    return _redis;
};

export const connectRedis = async (): Promise<void> => {
    const redisClient = getRedis();
    await redisClient.connect();
};

export const redis = {
    get connection() {
        return getRedis();
    }
};

export const disconnectRedis = async (): Promise<void> => {
    if (_redis) {
        await _redis.quit();
        _redis = null;
    }
};
