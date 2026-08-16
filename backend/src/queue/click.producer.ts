import { getChannel, CLICK_QUEUE } from './rabbitmq.client';
import { urlRepository } from '../modules/url/url.repository';
import { parseClickData } from '../utils/parse-click.util';

export interface ClickMessage {
  urlId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  clickedAt: string;
}

export function publishClickEvent(message: ClickMessage): void {
  try {
    const channel = getChannel();
    if (channel) {
      // Happy path: RabbitMQ is available, push to queue for async processing
      channel.sendToQueue(CLICK_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } else {
      // Fallback: write directly to DB when RabbitMQ is unavailable
      writeClickDirectly(message).catch((err) =>
        console.error('Failed to write click directly to DB:', err)
      );
    }
  } catch (err) {
    console.error('Failed to publish click event to queue:', err);
  }
}

/** Direct DB write fallback when RabbitMQ is unavailable */
async function writeClickDirectly(message: ClickMessage): Promise<void> {
  const parsed = parseClickData(message.userAgent, message.ipAddress);

  await urlRepository.createClickEvent({
    urlId: message.urlId,
    ipAddress: message.ipAddress,
    userAgent: message.userAgent,
    referrer: message.referrer,
    browser: parsed.browser,
    os: parsed.os,
    device: parsed.device,
    country: parsed.country,
  });
}