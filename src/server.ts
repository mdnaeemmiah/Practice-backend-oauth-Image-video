import mongoose from 'mongoose';
import { Server } from 'http';
import config from './app/config';
import app from './app';

let server: Server;
const port = config.port;

async function main() {
  try {
    // Log connection attempt
    console.log('🔗 Attempting MongoDB connection...');
    console.log('DB URL:', config.database_url?.replace(/:[^:]+@/, ':***@')); // Hide password

    // Check if DB_URL exists
    if (!config.database_url) {
      throw new Error('❌ DB_URL is not defined in environment variables');
    }

    // Mongoose connection with Vercel-optimized settings
    await mongoose.connect(config.database_url as string, {
      // Increased timeouts for serverless
      serverSelectionTimeoutMS: 120000, // 2 minutes
      socketTimeoutMS: 120000,
      connectTimeoutMS: 120000,

      // Connection pooling for serverless
      maxPoolSize: 5,
      minPoolSize: 1,

      // Family 4 only (IPv4) - helps with some network issues
      family: 4,

      // Retry logic
      retryWrites: true,
      w: 'majority',

      // App name for Atlas monitoring
      appName: 'practice-backend',
    });

    console.log('✅ MongoDB connected successfully');
    console.log('✅ Mongoose state:', mongoose.connection.readyState);

    server = app.listen(port, () => {
      console.log(`🚀 practice app listening on port ${port}`);
    });

    // Log when DB disconnects unexpectedly
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    console.error('⚠️ Make sure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access');
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', (reason) => {
  console.error(`❌ unhandledRejection:`, reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(`❌ uncaughtException:`, error);
  process.exit(1);
});
