import mongoose from 'mongoose';

// Define the structure for our cached connection
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Initialize the cached connection object
// In development, use a global variable to preserve the connection across hot reloads
// In production, this will be created fresh on each serverless function invocation
let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes a connection to the MongoDB database
 * Uses caching to prevent multiple connections in development (hot reload scenarios)
 * @returns {Promise<typeof mongoose>} The mongoose instance
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable buffering to fail fast if connection is lost
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection to establish and cache it
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the promise to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
