import dns from 'dns';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const mongoDbName = process.env.MONGODB_DB || 'cravings';
const dataDir = path.join(process.cwd(), 'data');

const collections = {
  login: 'login.json',
  register: 'register.json',
  contact: 'contact.json',
  feedback: 'feedback.json',
  support: 'support.json',
  menu: 'menu.json',
};

function loadJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`Failed to parse ${fileName}:`, err.message);
    return [];
  }
}

async function migrate() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(mongoDbName);
    console.log(`Connected to MongoDB at ${mongoUri}/${mongoDbName}`);

    for (const [collectionName, fileName] of Object.entries(collections)) {
      const items = loadJson(fileName);
      if (!items.length) {
        console.log(`Skipping ${collectionName}: no records in ${fileName}`);
        continue;
      }

      const collection = db.collection(collectionName);
      const existingCount = await collection.countDocuments();

      if (existingCount > 0) {
        console.log(`Skipping ${collectionName}: collection already has ${existingCount} records`);
        continue;
      }

      const result = await collection.insertMany(items);
      console.log(`Migrated ${result.insertedCount} ${collectionName} records from ${fileName}`);
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
