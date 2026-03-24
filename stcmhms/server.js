// server.js
import express from 'express';
import cors from 'cors';
import suggestEmotions from './suggest-emotions.js';
import 'dotenv/config'; // automatically loads .env into process.env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount your suggest-emotions handler
app.use('/', suggestEmotions);


// Optional health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);
