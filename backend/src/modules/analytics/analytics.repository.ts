import { prisma } from '../../database/prisma.client';

export const analyticsRepository = {
  countClicks(urlId: string, from?: Date, to?: Date) {
    return prisma.clickEvent.count({
      where: { urlId, clickedAt: { gte: from, lte: to } },
    });
  },

  groupByBrowser(urlId: string, from?: Date, to?: Date) {
    return prisma.clickEvent.groupBy({
      by: ['browser'],
      where: { urlId, clickedAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { browser: 'desc' } },
    });
  },

  groupByOs(urlId: string, from?: Date, to?: Date) {
    return prisma.clickEvent.groupBy({
      by: ['os'],
      where: { urlId, clickedAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { os: 'desc' } },
    });
  },

  groupByDevice(urlId: string, from?: Date, to?: Date) {
    return prisma.clickEvent.groupBy({
      by: ['device'],
      where: { urlId, clickedAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { device: 'desc' } },
    });
  },

  groupByCountry(urlId: string, from?: Date, to?: Date) {
    return prisma.clickEvent.groupBy({
      by: ['country'],
      where: { urlId, clickedAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
    });
  },

  groupByReferrer(urlId: string, from?: Date, to?: Date) {
    return prisma.clickEvent.groupBy({
      by: ['referrer'],
      where: { urlId, clickedAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { referrer: 'desc' } },
    });
  },

  clicksByDay(urlId: string, from?: Date, to?: Date) {
    const fromParam = from ?? null;
    const toParam = to ?? null;

    return prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "clickedAt") as day, COUNT(*)::bigint as count
      FROM click_events
      WHERE "urlId" = ${urlId}
        AND (${fromParam}::timestamp IS NULL OR "clickedAt" >= ${fromParam})
        AND (${toParam}::timestamp IS NULL OR "clickedAt" <= ${toParam})
      GROUP BY day
      ORDER BY day ASC
    `;
  },
};