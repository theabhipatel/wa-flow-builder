import mongoose from "mongoose";

// Global variable to cache the database connection for serverless
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async () => {
  // If we have a cached connection and it's connected, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
    
    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    // Set mongoose options for serverless environments
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    console.log("MongoDB connected");
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cachedConnection = null;
    // Don't use process.exit in serverless - it kills the function
    throw error;
  }
};
