import { urlRepository } from './url.repository';
import { encodeBase62 } from '../../utils/base62.util';
import { assertUrlAccess } from './url.authorization';
import { getCachedUrl, setCachedUrl, setCachedNotFound, invalidateCachedUrl } from '../../cache/url-cache.util';
import { publishClickEvent } from '../../queue/click.producer';

interface CreateUrlInput {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: Date;
  userId: string;
}

interface UpdateUrlInput {
  originalUrl?: string;
  expiresAt?: Date;
}

interface RequestingUser {
  userId: string;
  roles: string[];
}

interface ClickData {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

export const urlService = {
  async createUrl(input: CreateUrlInput) {
    let shortCode: string;
    let sequence: bigint;

    if (input.customAlias) {
      const existing = await urlRepository.findByShortCode(input.customAlias);
      if (existing) {
        const error: any = new Error('This alias is already taken');
        error.statusCode = 409;
        throw error;
      }
      sequence = await urlRepository.getNextSequence();
      shortCode = input.customAlias;
    } else {
      sequence = await urlRepository.getNextSequence();
      shortCode = encodeBase62(sequence);
    }

    const url = await urlRepository.createUrl({
      sequence,
      shortCode,
      originalUrl: input.originalUrl,
      userId: input.userId,
      expiresAt: input.expiresAt,
    });

    await invalidateCachedUrl(shortCode);

    return url;
  },

  async deleteUrl(urlId: string, requestingUser: RequestingUser) {
    const url = await urlRepository.findById(urlId);
    assertUrlAccess(url, requestingUser, 'delete');
    await urlRepository.softDeleteUrl(urlId);
    await invalidateCachedUrl(url!.shortCode);
  },

  async updateUrl(urlId: string, input: UpdateUrlInput, requestingUser: RequestingUser) {
    const url = await urlRepository.findById(urlId);
    assertUrlAccess(url, requestingUser, 'update');
    const updated = await urlRepository.updateUrl(urlId, input);
    await invalidateCachedUrl(updated.shortCode);
    return updated;
  },

  async resolveRedirect(shortCode: string) {
    const cached = await getCachedUrl(shortCode);

    if (cached === 'NOT_FOUND') {
      const error: any = new Error('Short link not found');
      error.statusCode = 404;
      throw error;
    }

    if (cached) {
      if (!cached.isActive) {
        await invalidateCachedUrl(shortCode);
        const error: any = new Error('Short link not found');
        error.statusCode = 404;
        throw error;
      }

      if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
        await invalidateCachedUrl(shortCode);
        const error: any = new Error('This short link has expired');
        error.statusCode = 410;
        throw error;
      }

      return {
        id: cached.id,
        shortCode,
        originalUrl: cached.originalUrl,
        expiresAt: cached.expiresAt ? new Date(cached.expiresAt) : null,
      };
    }

    const url = await urlRepository.findByShortCode(shortCode);

    if (!url || !url.isActive) {
      await setCachedNotFound(shortCode);
      const error: any = new Error('Short link not found');
      error.statusCode = 404;
      throw error;
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      const error: any = new Error('This short link has expired');
      error.statusCode = 410;
      throw error;
    }

    await setCachedUrl(shortCode, {
      id: url.id,
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt ? url.expiresAt.toISOString() : null,
      isActive: url.isActive,
    });

    return url;
  },

  async logClick(urlId: string, data: ClickData) {
    publishClickEvent({
      urlId,
      ipAddress: data.ipAddress ?? 'unknown',
      userAgent: data.userAgent ?? 'unknown',
      referrer: data.referrer,
      clickedAt: new Date().toISOString(),
    });
  },

  async listUserUrls(userId: string, page: number, limit: number) {
    const [urls, total] = await Promise.all([
      urlRepository.findByUserId(userId, page, limit),
      urlRepository.countByUserId(userId),
    ]);

    return {
      urls: urls.map((url) => ({
        id: url.id,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        totalClicks: url._count.clickEvents,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};