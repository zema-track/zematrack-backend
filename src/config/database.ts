import mongoose from 'mongoose';
import { config } from '.';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connectionString: string;

  private constructor() {
    this.connectionString = config.mongodbUri
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    try { 

      const options = {
        maxPoolSize: 10, 
        serverSelectionTimeoutMS: 1000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      await mongoose.connect(this.connectionString, options);
      
      console.log('Database connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('Database connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('Database disconnected');
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  getConnectionState(): string {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState];
  }
}

export default DatabaseConnection;
