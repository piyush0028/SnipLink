import 'dotenv/config';
import amqplib from 'amqplib';
import { urlRepository } from '../modules/url/url.repository';
import { parseClickData } from '../utils/parse-click.util';

const CLICK_QUEUE = 'click_events_queue';

interface ClickMessage {
  urlId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  clickedAt: string;
}

async function startWorker() {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL as string);
  const channel = await connection.createChannel();

  await channel.assertQueue(CLICK_QUEUE, { durable: true });
  channel.prefetch(1);

  console.log('Click worker started, waiting for messages...');

  channel.consume(CLICK_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const message: ClickMessage = JSON.parse(msg.content.toString());
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

      channel.ack(msg);
    } catch (err) {
      console.error('Failed to process click message:', err);
      channel.nack(msg, false, false);
    }
  });
}

startWorker().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});