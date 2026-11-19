require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.mongodb_url || process.env.MONGODB_URL || process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGODB_URI) {
    console.warn("⚠️ Warning: No MongoDB URI found in environment variables (mongodb_url, MONGODB_URL, or MONGODB_URI).");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongooseInstance) => {
      console.log("db is connected");
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error("MongoDB connection error:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

module.exports = { connectDB };
