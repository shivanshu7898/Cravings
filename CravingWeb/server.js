import express from 'express';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(process.cwd(), 'data');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const mongoDbName = process.env.MONGODB_DB || 'cravings';
const client = new MongoClient(mongoUri);
let db = null;
let useMongo = false;

async function connectMongo() {
  try {
    await client.connect();
    db = client.db(mongoDbName);
    useMongo = true;
    console.log(`MongoDB connected: ${mongoUri}/${mongoDbName}`);
  } catch (err) {
    console.warn('MongoDB connection failed, using local JSON files:', err.message);
  }
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getFilePath(fileName) {
  return path.join(dataDir, fileName);
}

function loadJson(fileName) {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(content || '[]');
  } catch (err) {
    return [];
  }
}

function saveJson(fileName, items) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
}

function appendJson(fileName, entry) {
  const list = loadJson(fileName);
  list.push({ ...entry, createdAt: new Date().toISOString() });
  saveJson(fileName, list);
  return list;
}

async function loadData(collectionName) {
  if (useMongo) {
    return await db.collection(collectionName).find().sort({ createdAt: 1 }).toArray();
  }
  return loadJson(`${collectionName}.json`);
}

async function appendData(collectionName, entry) {
  const item = { ...entry, createdAt: new Date().toISOString() };
  if (useMongo) {
    await db.collection(collectionName).insertOne(item);
    return await loadData(collectionName);
  }
  return appendJson(`${collectionName}.json`, entry);
}

async function countData(collectionName) {
  if (useMongo) {
    return await db.collection(collectionName).countDocuments();
  }
  return loadJson(`${collectionName}.json`).length;
}

ensureDataDir();
await connectMongo();

app.use(express.json());
app.use(express.static(process.cwd()));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'home.html'));
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  await appendData('login', { email, password });
  res.json({ success: true, message: 'Login received. This is a demo backend response.' });
});

app.post('/api/register', async (req, res) => {
  const { name, email, phone, role, password, confirmPassword } = req.body;
  if (!name || !email || !phone || !role || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All registration fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }
  await appendData('register', { name, email, phone, role });
  res.json({ success: true, message: 'Registration successful. Welcome to Cravings!' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all contact fields.' });
  }
  await appendData('contact', { name, email, phone, subject, message });
  res.json({ success: true, message: 'Contact request saved. We will respond soon.' });
});

app.post('/api/feedback', async (req, res) => {
  const { name, email, category, rating, message } = req.body;
  if (!name || !email || !category || !message) {
    return res.status(400).json({ success: false, message: 'Please complete the feedback form.' });
  }
  await appendData('feedback', { name, email, category, rating, message });
  res.json({ success: true, message: 'Thank you for your feedback!' });
});

app.post('/api/support', async (req, res) => {
  const { name, email, issueType, orderId, message } = req.body;
  if (!name || !email || !issueType || !message) {
    return res.status(400).json({ success: false, message: 'Please complete the support ticket.' });
  }
  await appendData('support', { name, email, issueType, orderId, message });
  res.json({ success: true, message: 'Support ticket submitted. We will reply soon.' });
});

// Menu endpoints: store and retrieve menu items
app.get('/api/menu', async (req, res) => {
  const items = await loadData('menu');
  res.json({ success: true, items });
});

app.post('/api/menu', async (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Name and price are required.' });
  }
  const entry = { name, price: Number(price) || 0, image: image || 'pics/HOTEL/UnderTree.png' };
  await appendData('menu', entry);
  res.json({ success: true, message: 'Menu item added.', item: entry });
});

app.get('/api/status', async (req, res) => {
  const login = await countData('login');
  const register = await countData('register');
  const contact = await countData('contact');
  const feedback = await countData('feedback');
  const support = await countData('support');
  res.json({ success: true, counts: { login, register, contact, feedback, support } });
});

app.listen(port, () => {
  console.log(`Cravings backend server running at http://localhost:${port}`);
});
