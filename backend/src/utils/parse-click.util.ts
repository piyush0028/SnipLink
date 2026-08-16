import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

interface ParsedClickData {
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
}

export function parseClickData(userAgent: string, ipAddress: string): ParsedClickData {
  const { browser, os, device } = UAParser(userAgent);
  const geo = ipAddress !== 'unknown' ? geoip.lookup(ipAddress) : null;

  return {
    browser: browser.name ?? null,
    os: os.name ?? null,
    device: device.type ?? 'desktop',
    country: geo?.country ?? null,
  };
}