import 'dotenv/config';
import app from './app';
import { connectRedis } from './cache/redis.client';
import { connectRabbitMQ } from './queue/rabbitmq.client';

const PORT = process.env.PORT ?? 3000;

async function startServer() {
  // Both connections are non-fatal — the server will start regardless
  await connectRedis();
  await connectRabbitMQ();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();