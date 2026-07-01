import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import sharp from 'sharp';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (_req, res) => {
  res.json({ message: 'Meal Prep API' });
});

app.use('/api/auth', authRoutes);

// Image upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.post('/api/meals/:id/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }
  const filename = `${crypto.randomUUID()}.jpg`;
  const dest = path.join(uploadsDir, filename);
  await sharp(req.file.buffer)
    .resize({ width: 1000, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(dest);
  res.json({ image_path: filename });
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
