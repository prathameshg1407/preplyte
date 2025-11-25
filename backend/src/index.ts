import 'dotenv/config'; // Load env vars immediately
import app from './app';
import { prisma } from './lib/db';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // 1. Check Database Connection
    // We run a simple query to ensure the DB is reachable before accepting requests
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');

    // 2. Start Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`👉 http://localhost:${PORT}/health`);
    });

    // 3. Graceful Shutdown Logic
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Closing HTTP server...`);
      
      server.close(async () => {
        console.log('HTTP server closed.');
        
        // Disconnect DB
        console.log('Closing database connection...');
        await prisma.$disconnect();
        console.log('Database connection closed.');
        
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();