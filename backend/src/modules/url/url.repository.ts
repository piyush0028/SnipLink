import { prisma } from '../../database/prisma.client';

export const urlRepository = {
  async getNextSequence(): Promise<bigint> {
    const result = await prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('urls_sequence_seq')`;
    return result[0].nextval;
  },

  findByShortCode(shortCode: string) {
    return prisma.url.findUnique({ where: { shortCode } });
  },

  findById(id: string) {
    return prisma.url.findUnique({ where: { id } });
  },

  findByUserId(userId: string, page: number, limit: number) {
    return prisma.url.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { clickEvents: true } } },
    });
  },

  countByUserId(userId: string) {
    return prisma.url.count({ where: { userId, isActive: true } });
  },

  createUrl(data: {
    sequence: bigint;
    shortCode: string;
    originalUrl: string;
    userId: string;
    expiresAt?: Date;
  }) {
    return prisma.url.create({ data });
  },

  softDeleteUrl(id: string) {
    return prisma.url.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  },

  updateUrl(id: string, data: { originalUrl?: string; expiresAt?: Date }) {
    return prisma.url.update({
      where: { id },
      data,
    });
  },

  createClickEvent(data: {
    urlId: string;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    browser?: string | null;
    os?: string | null;
    device?: string | null;
    country?: string | null;
  }) {
    return prisma.clickEvent.create({ data });
  },
};