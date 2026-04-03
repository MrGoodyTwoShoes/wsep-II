import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors());

// Set correct MIME type for JavaScript files
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.mjs')) {
    res.set('Content-Type', 'text/javascript');
  }
  next();
});

// Serve static files
app.use(express.static(__dirname));

app.listen(5175, () => {
  console.log('Server running at http://localhost:5175');
});