import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Meal Prep API' });
});

app.use('/api/auth', authRoutes);

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
