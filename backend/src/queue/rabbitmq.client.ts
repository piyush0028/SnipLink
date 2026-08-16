import amqplib, { ChannelModel, Channel } from 'amqplib';

export const CLICK_QUEUE = 'click_events_queue';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnected = false;

export async function connectRabbitMQ(): Promise<void> {
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL as string);

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      isConnected = false;
    });

    connection.on('close', () => {
      console.warn('⚠️  RabbitMQ connection closed');
      isConnected = false;
    });

    channel = await connection.createChannel();
    await channel.assertQueue(CLICK_QUEUE, { durable: true });

    isConnected = true;
    console.log('RabbitMQ connected');
  } catch (err) {
    console.warn('⚠️  RabbitMQ failed to connect — click events will be written directly to DB:', (err as Error).message);
    isConnected = false;
  }
}

export function isRabbitMQAvailable(): boolean {
  return isConnected && channel !== null;
}

export function getChannel(): Channel | null {
  return isConnected ? channel : null;
}