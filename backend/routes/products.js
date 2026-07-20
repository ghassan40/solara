// routes/products.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?category=&q=&page=&limit= - public
router.get('/', (req, res) => {
  const { category, q } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE is_active = 1';
  const params = [];

  if (category) {
    where += ' AND category_id = ?';
    params.push(category);
  }
  if (q) {
    where += ' AND (name_ar LIKE ? OR name_en LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  const products = db
    .prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const total = db.prepare(`SELECT COUNT(*) as c FROM products ${where}`).get(...params).c;

  res.json({ products, total, page, limit });
});

// GET /api/products/:id - public
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  res.json({ product });
});

// POST /api/products - admin/store_manager only
router.post('/', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const {
    category_id,
    name_ar,
    name_en,
    description,
    price,
    compare_at_price,
    unit,
    image_url,
    stock_qty,
  } = req.body;

  if (!name_ar || price == null) {
    return res.status(400).json({ error: 'اسم المنتج والسعر مطلوبين' });
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO products
      (id, category_id, name_ar, name_en, description, price, compare_at_price, unit, image_url, stock_qty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    category_id || null,
    name_ar,
    name_en || null,
    description || null,
    price,
    compare_at_price || null,
    unit || 'قطعة',
    image_url || null,
    stock_qty || 0
  );

  res.status(201).json({ product: db.prepare('SELECT * FROM products WHERE id = ?').get(id) });
});

// PUT /api/products/:id - admin/store_manager only
router.put('/:id', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'المنتج غير موجود' });

  const fields = [
    'category_id',
    'name_ar',
    'name_en',
    'description',
    'price',
    'compare_at_price',
    'unit',
    'image_url',
    'stock_qty',
    'is_active',
  ];
  const merged = {};
  fields.forEach((f) => (merged[f] = req.body[f] !== undefined ? req.body[f] : existing[f]));

  db.prepare(
    `UPDATE products SET category_id=?, name_ar=?, name_en=?, description=?, price=?, compare_at_price=?, unit=?, image_url=?, stock_qty=?, is_active=? WHERE id=?`
  ).run(
    merged.category_id,
    merged.name_ar,
    merged.name_en,
    merged.description,
    merged.price,
    merged.compare_at_price,
    merged.unit,
    merged.image_url,
    merged.stock_qty,
    merged.is_active,
    req.params.id
  );

  res.json({ product: db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) });
});

// DELETE /api/products/:id - admin/store_manager only (soft delete)
router.delete('/:id', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
