import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
const distPath = path.join(__dirname, 'dist');
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// SQLite database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE claims (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, name TEXT, phoneNumber TEXT, orderNumber TEXT, returnAddress TEXT, brand TEXT, problem TEXT)");
});

app.post('/api/claims', (req, res) => {
  console.log('Received claim submission:', req.body);
  const { email, name, phoneNumber, orderNumber, returnAddress, brand, problem } = req.body;
  const stmt = db.prepare("INSERT INTO claims (email, name, phoneNumber, orderNumber, returnAddress, brand, problem) VALUES (?, ?, ?, ?, ?, ?, ?)");
  stmt.run([email, name, phoneNumber, orderNumber, returnAddress, brand, problem], function(err) {
    if (err) {
      console.error('Error inserting claim:', err);
      return res.status(500).json({ error: 'Failed to submit claim' });
    }
    console.log('Claim submitted successfully, ID:', this.lastID);
    res.json({ claimNumber: this.lastID });
  });
  stmt.finalize();
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Attempting to serve:', indexPath);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('index.html not found at:', indexPath);
    res.status(404).send('index.html not found');
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('An unexpected error occurred');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Current directory:', __dirname);
  try {
    console.log('Contents of current directory:', fs.readdirSync(__dirname));
    console.log('Contents of dist directory:', fs.readdirSync(path.join(__dirname, 'dist')));
  } catch (error) {
    console.error('Error reading directory contents:', error);
  }
});