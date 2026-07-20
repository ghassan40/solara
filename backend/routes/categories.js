// routes/categories.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - public
router.get('/', (req, res) => {
  const categories = db
    .prepare('SELECT * FROM categories ORDER BY sort_order ASC, name_ar ASC')
    .all();
  res.json({ categories });
});

// POST /api/categories - admin only
router.post('/', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const { name_ar, name_en, icon, sort_order, parent_id } = req.body;
  if (!name_ar) return res.status(400).json({ error: 'اسم القسم مطلوب' });

  const id = uuidv4();
  db.prepare(
    `INSERT INTO categories (id, name_ar, name_en, icon, sort_order, parent_id) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, name_ar, name_en || null, icon || null, sort_order || 0, parent_id || null);

  res.status(201).json({ category: db.prepare('SELECT * FROM categories WHERE id = ?').get(id) });
});

// PUT /api/categories/:id - admin only
router.put('/:id', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const { name_ar, name_en, icon, sort_order, parent_id } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'القسم غير موجود' });

  db.prepare(
    `UPDATE categories SET name_ar=?, name_en=?, icon=?, sort_order=?, parent_id=? WHERE id=?`
  ).run(
    name_ar ?? existing.name_ar,
    name_en ?? existing.name_en,
    icon ?? existing.icon,
    sort_order ?? existing.sort_order,
    parent_id ?? existing.parent_id,
    req.params.id
  );

  res.json({ category: db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) });
});

// DELETE /api/categories/:id - admin only
router.delete('/:id', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
