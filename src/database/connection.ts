import mongoose from 'mongoose';

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  state: string;
  provider: string;
  database: string | null;
  host: string | null;
  port: number | null;
  error?: string | null;
}

const STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized'
};

/**
 * Connect to MongoDB Atlas using the configured MONGODB_URI.
 */
export async function connectToDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  [MongoDB] MONGODB_URI not found in environment. Running in offline JSON fallback mode.');
    return false;
  }

  // If already connected, return early
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`🍃 [MongoDB] Connecting to Atlas at: ${maskedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });

    console.log(`✅ [MongoDB] Successfully connected! Database: "${mongoose.connection.name}" on host: ${mongoose.connection.host}`);
    return true;
  } catch (error: any) {
    console.error('❌ [MongoDB] Connection error:', error.message);
    return false;
  }
}

/**
 * Returns current MongoDB connection health details.
 */
export function getConnectionStatus(): DatabaseConnectionStatus {
  const stateCode = mongoose.connection.readyState;
  const isConnected = stateCode === 1;

  return {
    isConnected,
    state: STATES[stateCode] || 'unknown',
    provider: isConnected ? 'MongoDB Atlas' : 'Local JSON Ledger Fallback',
    database: isConnected ? mongoose.connection.name : null,
    host: isConnected ? mongoose.connection.host : null,
    port: isConnected ? mongoose.connection.port : null
  };
}

// Global lifecycle event listeners
mongoose.connection.on('connected', () => {
  console.log(`🍃 [MongoDB Event] Connection open to ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ [MongoDB Event] Runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  [MongoDB Event] Disconnected from Atlas. Automatic reconnection pending...');
});

