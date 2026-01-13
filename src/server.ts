import mongoose from 'mongoose';
import { Server } from 'http';
import config from './app/config';
import app from './app';

let server: Server;
const port = config.port;

async function main() {
  try {
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });

    console.log('✅ Connected to MongoDB successfully');

    server = app.listen(port, () => {
      console.log(`practice app listening on port ${port}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', () => {
  console.log(`😈🙉 unhandledRejection is detected. Shutting down...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈🙉 uncaughtException is detected. Shutting down...`);
  process.exit(1);
});
