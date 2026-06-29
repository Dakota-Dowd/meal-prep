import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Meal Prep API' });
});

// Auth stubs
app.post('/api/auth/register', (req, res) => {
  const { username, passcode } = req.body;
  if (passcode !== 'meal-prep-passcode') {
    return res.status(401).json({ error: 'Invalid passcode' });
  }
  res.json({ token: 'mock-token', username });
});

app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  res.json({ token: 'mock-token', username });
});

// Meals stubs
app.get('/api/meals', (_req, res) => {
  res.json([]);
});

app.post('/api/meals', (req, res) => {
  console.log('New meal:', req.body);
  res.status(201).json({ id: 'stub', ...req.body });
});

// Selected meals stubs
app.get('/api/selected-meals', (_req, res) => {
  res.json([]);
});

app.post('/api/selected-meals', (req, res) => {
  console.log('Selected meals updated:', req.body);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
