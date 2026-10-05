import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { realtimeService } from './services/realtime.service';
import { outboxService } from './services/outbox.service';

async function bootstrap() {
  // 1. Connect to Database
  await connectDB();

  // 2. Create HTTP server
  const server = http.createServer(app);

  // 3. Initialize Realtime Socket.IO
  realtimeService.initialize(server);

  // 4. Start Outbox background worker
  outboxService.startWorker(4000);

  // 5. Start listening
  server.listen(env.PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🔮 Mystic Tarot Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Database: Connected to MongoDB`);
    console.log(`Outbox: Worker running (4s polling interval)`);
    console.log(`======================================================\n`);
  });

  const gracefulShutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    outboxService.stopWorker();
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
