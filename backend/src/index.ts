import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (_req, res) => {
  res.json({ message: 'Meal Prep API' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
