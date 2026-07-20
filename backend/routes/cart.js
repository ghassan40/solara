// routes/cart.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function getOrCreateCart(userId) {
  let cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(userId);
  if (!cart) {
    const id = uuidv4();
    db.prepare('INSERT INTO carts (id, user_id) VALUES (?, ?)').run(id, userId);
    cart = db.prepare('SELECT * FROM carts WHERE id = ?').get(id);
  }
  return cart;
}

function getCartWithItems(cartId) {
  const items = db
    .prepare(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name_ar, p.price, p.image_url, p.unit, p.stock_qty
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?`
    )
    .all(cartId);

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  return { items, subtotal };
}

// GET /api/cart
router.get('/', requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  res.json(getCartWithItems(cart.id));
});

// POST /api/cart/items  { product_id, quantity }
router.post('/items', requireAuth, (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id) return res.status(400).json({ error: 'المنتج مطلوب' });
  const qty = Math.max(parseInt(quantity) || 1, 1);

  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.status(404).json({ error: 'المنتج غير متوفر' });

  const cart = getOrCreateCart(req.user.id);
  const existing = db
    .prepare('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?')
    .get(cart.id, product_id);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(
      existing.quantity + qty,
      existing.id
    );
  } else {
    db.prepare(
      'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)'
    ).run(uuidv4(), cart.id, product_id, qty);
  }

  res.status(201).json(getCartWithItems(cart.id));
});

// PUT /api/cart/items/:itemId  { quantity }
router.put('/items/:itemId', requireAuth, (req, res) => {
  const { quantity } = req.body;
  const cart = getOrCreateCart(req.user.id);
  const item = db
    .prepare('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?')
    .get(req.params.itemId, cart.id);
  if (!item) return res.status(404).json({ error: 'العنصر غير موجود بالسلة' });

  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  }

  res.json(getCartWithItems(cart.id));
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  db.prepare('DELETE FROM cart_items WHERE id = ? AND cart_id = ?').run(req.params.itemId, cart.id);
  res.json(getCartWithItems(cart.id));
});

// DELETE /api/cart - clear
router.delete('/', requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
  res.json(getCartWithItems(cart.id));
});

module.exports = router;
module.exports.getOrCreateCart = getOrCreateCart;
module.exports.getCartWithItems = getCartWithItems;
