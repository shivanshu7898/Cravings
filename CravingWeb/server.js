import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(process.cwd(), 'data');

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

function appendData(fileName, entry) {
  const list = loadJson(fileName);
  list.push({ ...entry, createdAt: new Date().toISOString() });
  saveJson(fileName, list);
  return list;
}

ensureDataDir();

app.use(express.json());
app.use(express.static(process.cwd()));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'home.html'));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  appendData('login.json', { email, password });
  res.json({ success: true, message: 'Login received. This is a demo backend response.' });
});

app.post('/api/register', (req, res) => {
  const { name, email, phone, role, password, confirmPassword } = req.body;
  if (!name || !email || !phone || !role || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All registration fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }
  appendData('register.json', { name, email, phone, role });
  res.json({ success: true, message: 'Registration successful. Welcome to Cravings!' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all contact fields.' });
  }
  appendData('contact.json', { name, email, phone, subject, message });
  res.json({ success: true, message: 'Contact request saved. We will respond soon.' });
});

app.post('/api/feedback', (req, res) => {
  const { name, email, category, rating, message } = req.body;
  if (!name || !email || !category || !message) {
    return res.status(400).json({ success: false, message: 'Please complete the feedback form.' });
  }
  appendData('feedback.json', { name, email, category, rating, message });
  res.json({ success: true, message: 'Thank you for your feedback!' });
});

app.post('/api/support', (req, res) => {
  const { name, email, issueType, orderId, message } = req.body;
  if (!name || !email || !issueType || !message) {
    return res.status(400).json({ success: false, message: 'Please complete the support ticket.' });
  }
  appendData('support.json', { name, email, issueType, orderId, message });
  res.json({ success: true, message: 'Support ticket submitted. We will reply soon.' });
});

// Menu endpoints: store and retrieve menu items
app.get('/api/menu', (req, res) => {
  const items = loadJson('menu.json');
  res.json({ success: true, items });
});

app.post('/api/menu', (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Name and price are required.' });
  }
  const entry = { name, price: Number(price) || 0, image: image || 'pics/HOTEL/UnderTree.png' };
  appendData('menu.json', entry);
  res.json({ success: true, message: 'Menu item added.', item: entry });
});

app.get('/api/status', (req, res) => {
  const login = loadJson('login.json').length;
  const register = loadJson('register.json').length;
  const contact = loadJson('contact.json').length;
  const feedback = loadJson('feedback.json').length;
  const support = loadJson('support.json').length;
  res.json({ success: true, counts: { login, register, contact, feedback, support } });
});

app.listen(port, () => {
  console.log(`Cravings backend server running at http://localhost:${port}`);
});
