import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
  if (isRedisConnected) {
    console.error('Redis Client Error:', err);
    isRedisConnected = false;
  }
});

redisClient.on('ready', () => {
  isRedisConnected = true;
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('Redis connected');
  } catch (err) {
    console.warn('⚠️  Redis failed to connect — running without cache:', (err as Error).message);
    isRedisConnected = false;
  }
}

export function isRedisAvailable(): boolean {
  return isRedisConnected && redisClient.isReady;
}

export { redisClient };