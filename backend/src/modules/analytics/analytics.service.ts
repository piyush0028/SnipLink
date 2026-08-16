import { urlRepository } from '../url/url.repository';
import { assertUrlAccess } from '../url/url.authorization';
import { analyticsRepository } from './analytics.repository';

interface RequestingUser {
  userId: string;
  roles: string[];
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export const analyticsService = {
  async getUrlAnalytics(urlId: string, range: DateRange, requestingUser: RequestingUser) {
    const url = await urlRepository.findById(urlId);
    assertUrlAccess(url, requestingUser, 'view analytics for');

    const { from, to } = range;

    const [totalClicks, byBrowser, byOs, byDevice, byCountry, byReferrer, byDay] = await Promise.all([
      analyticsRepository.countClicks(urlId, from, to),
      analyticsRepository.groupByBrowser(urlId, from, to),
      analyticsRepository.groupByOs(urlId, from, to),
      analyticsRepository.groupByDevice(urlId, from, to),
      analyticsRepository.groupByCountry(urlId, from, to),
      analyticsRepository.groupByReferrer(urlId, from, to),
      analyticsRepository.clicksByDay(urlId, from, to),
    ]);

    return {
      urlId,
      shortCode: url!.shortCode,
      totalClicks,
      byBrowser: byBrowser.map((r) => ({ browser: r.browser ?? 'Unknown', count: r._count._all })),
      byOs: byOs.map((r) => ({ os: r.os ?? 'Unknown', count: r._count._all })),
      byDevice: byDevice.map((r) => ({ device: r.device ?? 'Unknown', count: r._count._all })),
      byCountry: byCountry.map((r) => ({ country: r.country ?? 'Unknown', count: r._count._all })),
      byReferrer: byReferrer.map((r) => ({ referrer: r.referrer ?? 'Direct', count: r._count._all })),
      byDay: byDay.map((r) => ({ day: r.day, count: Number(r.count) })),
    };
  },
};