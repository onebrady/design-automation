const { MongoClient } = require('mongodb');

const mongoUri = process.env.AGENTIC_MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.AGENTIC_DB_NAME || 'agentic_design';

async function mongoHealth() {
  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 1000 });
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    return { mongoAvailable: true, lastOkAt: new Date().toISOString() };
  } catch {
    return { mongoAvailable: false, lastOkAt: null };
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

// Database helper pattern used throughout the server
async function withDb(operation) {
  let client;
  try {
    client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 1500 });
    await client.connect();
    const db = client.db(dbName);
    return await operation(db);
  } catch (error) {
    console.error('DB error', error.message);
    throw new Error(`Database error: ${error.message}`);
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

module.exports = {
  mongoHealth,
  withDb,
  mongoUri,
  dbName
};