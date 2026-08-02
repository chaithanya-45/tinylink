const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  // Don't throw here — throwing at module-load time would crash the whole
  // serverless function (including the "/" health check) even when only
  // the DB-touching routes need MONGO_URI. We throw later, inside
  // connectDB(), only when a request actually needs the database.
  console.warn(
    "⚠️  MONGO_URI is not set. Add it in Vercel → Project → Settings → Environment Variables."
  );
}

/**
 * Vercel serverless functions can reuse the same Node.js process (and
 * therefore the same module-level variables) across multiple invocations
 * when the container is still "warm". Mongoose/Node do NOT reset `global`
 * between invocations in that case.
 *
 * The old code called `mongoose.connect()` once at module load and just
 * logged success/failure — it never made the REQUEST HANDLERS wait for
 * that connection. On a cold start, the first request(s) would hit
 * `Link.findOne()` before the connection finished, and since Mongoose
 * buffers operations by default, they'd sit in the buffer for 10s and then
 * throw the exact error you saw:
 *   MongooseError: Operation `links.findOne()` buffering timed out after 10000ms
 *
 * Caching the connection (and the in-flight connection PROMISE) on
 * `global` fixes two problems at once:
 *   1. Every request awaits the same promise, so no query runs before the
 *      connection is actually ready.
 *   2. Warm invocations reuse the existing connection instead of opening a
 *      new one every time, which avoids exhausting Atlas's connection
 *      limit (a common source of mysterious timeouts under load).
 */
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGO_URI) {
    throw new Error(
      "MONGO_URI environment variable is not set. Add it in Vercel Project Settings -> Environment Variables, then redeploy."
    );
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);

    cached.promise = mongoose
      .connect(MONGO_URI, {
        // Fail fast with a clear error instead of silently buffering
        // operations for 10s and then throwing a confusing timeout.
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => {
        console.log("✅ Connected to MongoDB");
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset the cached promise so the NEXT request retries the
        // connection instead of being stuck forever with a rejected
        // promise cached in `global`.
        cached.promise = null;
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
