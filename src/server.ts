import mongoose from 'mongoose';
import { Server } from 'http';
import config from './app/config';
import app from './app';

let server: Server;
const port = config.port;

async function main() {
  try {
    if (!config.database_url) {
      throw new Error('DB_URL environment variable is missing');
    }

    // Fail fast if there is no connection instead of buffering queries
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', true);

    // Mongoose connection with serverless/Vercel optimized settings
    await mongoose.connect(config.database_url, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,

      maxPoolSize: 10,
      minPoolSize: 1,

      retryWrites: true,
    });

    console.log('✅ Connected to MongoDB successfully');

    server = app.listen(port, () => {
      console.log(`practice app listening on port ${port}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    // For Vercel: log but don't exit immediately - Vercel may retry
    setTimeout(() => process.exit(1), 5000);
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
