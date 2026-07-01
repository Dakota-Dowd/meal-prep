import { Router, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        m.id, m.name, m.tags, m.instructions, m.image_path, m.url, m.rating, m.prep_time_minutes,
        i.name AS ing_name, mi.quantity, mi.unit
      FROM meals m
      LEFT JOIN meal_ingredients mi ON mi.meal_id = m.id
      LEFT JOIN ingredients i ON i.id = mi.ingredient_id
      WHERE m.user_id = ?
      ORDER BY m.name, i.name
    `, [req.userId]);

    const map = new Map<number, any>();
    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: String(row.id),
          name: row.name,
          tags: row.tags || [],
          instructions: row.instructions || undefined,
          image_path: row.image_path || undefined,
          url: row.url || undefined,
          rating: row.rating ?? undefined,
          prep_time_minutes: row.prep_time_minutes ?? undefined,
          ingredients: [],
        });
      }
      if (row.ing_name) {
        map.get(row.id).ingredients.push({
          name: row.ing_name,
          quantity: parseFloat(row.quantity),
          unit: row.unit,
        });
      }
    }

    res.json(Array.from(map.values()));
  } catch (err) {
    console.error('GET /api/meals error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, tags, ingredients, instructions, image_path, url, rating, prep_time_minutes } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result]: any = await conn.query(
      'INSERT INTO meals (user_id, name, tags, instructions, image_path, url, rating, prep_time_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, name, JSON.stringify(tags || []), instructions || null, image_path || null, url || null, rating ?? null, prep_time_minutes ?? null]
    );
    const mealId = result.insertId;

    for (const ing of (ingredients || [])) {
      await conn.query('INSERT IGNORE INTO ingredients (name) VALUES (?)', [ing.name]);
      const [ingRows]: any = await conn.query('SELECT id FROM ingredients WHERE name = ?', [ing.name]);
      await conn.query(
        'INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
        [mealId, ingRows[0].id, ing.quantity, ing.unit]
      );
    }

    await conn.commit();
    res.status(201).json({
      id: String(mealId), name, tags: tags || [], ingredients: ingredients || [],
      instructions, image_path, url, rating, prep_time_minutes,
    });
  } catch (err) {
    await conn.rollback();
    console.error('POST /api/meals error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const mealId = parseInt(req.params.id, 10);
  const { name, tags, ingredients, instructions, image_path, url, rating, prep_time_minutes } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing]: any = await conn.query(
      'SELECT id FROM meals WHERE id = ? AND user_id = ?',
      [mealId, req.userId]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    await conn.query(
      'UPDATE meals SET name=?, tags=?, instructions=?, image_path=?, url=?, rating=?, prep_time_minutes=? WHERE id=?',
      [name, JSON.stringify(tags || []), instructions || null, image_path || null, url || null, rating ?? null, prep_time_minutes ?? null, mealId]
    );

    await conn.query('DELETE FROM meal_ingredients WHERE meal_id = ?', [mealId]);

    for (const ing of (ingredients || [])) {
      await conn.query('INSERT IGNORE INTO ingredients (name) VALUES (?)', [ing.name]);
      const [ingRows]: any = await conn.query('SELECT id FROM ingredients WHERE name = ?', [ing.name]);
      await conn.query(
        'INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
        [mealId, ingRows[0].id, ing.quantity, ing.unit]
      );
    }

    await conn.commit();
    res.json({
      id: String(mealId), name, tags: tags || [], ingredients: ingredients || [],
      instructions, image_path, url, rating, prep_time_minutes,
    });
  } catch (err) {
    await conn.rollback();
    console.error('PUT /api/meals/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const mealId = parseInt(req.params.id, 10);
  try {
    const [existing]: any = await pool.query(
      'SELECT id FROM meals WHERE id = ? AND user_id = ?',
      [mealId, req.userId]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    await pool.query('DELETE FROM meal_ingredients WHERE meal_id = ?', [mealId]);
    await pool.query('DELETE FROM meals WHERE id = ?', [mealId]);

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/meals/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
