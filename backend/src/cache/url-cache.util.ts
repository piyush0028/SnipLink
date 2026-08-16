import { redisClient, isRedisAvailable } from './redis.client';

const CACHE_TTL_SECONDS = 3600;
const NOT_FOUND_TTL_SECONDS = 60;
const NOT_FOUND_MARKER = '__NOT_FOUND__';

interface CachedUrl {
  id: string;
  originalUrl: string;
  expiresAt: string | null;
  isActive: boolean;
}

function cacheKey(shortCode: string): string {
  return `url:${shortCode}`;
}

export async function getCachedUrl(shortCode: string): Promise<CachedUrl | 'NOT_FOUND' | null> {
  if (!isRedisAvailable()) return null;
  try {
    const raw = await redisClient.get(cacheKey(shortCode));
    if (raw === null) return null;
    if (raw === NOT_FOUND_MARKER) return 'NOT_FOUND';
    return JSON.parse(raw) as CachedUrl;
  } catch {
    return null;
  }
}

export async function setCachedUrl(shortCode: string, data: CachedUrl): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    await redisClient.setEx(cacheKey(shortCode), CACHE_TTL_SECONDS, JSON.stringify(data));
  } catch { /* ignore */ }
}

export async function setCachedNotFound(shortCode: string): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    await redisClient.setEx(cacheKey(shortCode), NOT_FOUND_TTL_SECONDS, NOT_FOUND_MARKER);
  } catch { /* ignore */ }
}

export async function invalidateCachedUrl(shortCode: string): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    await redisClient.del(cacheKey(shortCode));
  } catch { /* ignore */ }
}