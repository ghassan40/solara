// routes/orders.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const cartHelpers = require('./cart');

const router = express.Router();
const DELIVERY_FEE = 7; // ريال - رسم توصيل ثابت للنسخة الأولى

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

// POST /api/orders - checkout (customer)
router.post('/', requireAuth, (req, res) => {
  const { address_id, payment_method, notes } = req.body;

  const cart = cartHelpers.getOrCreateCart(req.user.id);
  const { items, subtotal } = cartHelpers.getCartWithItems(cart.id);

  if (items.length === 0) {
    return res.status(400).json({ error: 'السلة فارغة' });
  }

  const orderId = uuidv4();
  const total = subtotal + DELIVERY_FEE;

  const insertOrder = db.prepare(
    `INSERT INTO orders (id, user_id, address_id, status, subtotal, delivery_fee, total, payment_method, notes)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertHistory = db.prepare(
    `INSERT INTO order_status_history (id, order_id, status) VALUES (?, ?, 'pending')`
  );
  const clearCart = db.prepare('DELETE FROM cart_items WHERE cart_id = ?');

  const tx = db.transaction(() => {
    insertOrder.run(
      orderId,
      req.user.id,
      address_id || null,
      subtotal,
      DELIVERY_FEE,
      total,
      payment_method || 'cod',
      notes || null
    );
    for (const it of items) {
      insertItem.run(uuidv4(), orderId, it.product_id, it.name_ar, it.price, it.quantity);
    }
    insertHistory.run(uuidv4(), orderId);
    clearCart.run(cart.id);
  });
  tx();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  res.status(201).json({ order, items: orderItems });
});

// GET /api/orders - customer's own orders
router.get('/', requireAuth, (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json({ orders });
});

// GET /api/orders/:id - order detail + tracking history
router.get('/:id', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

  // customers can only see their own orders; staff can see all
  if (order.user_id !== req.user.id && !['admin', 'store_manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'ما تقدر تشوف هذا الطلب' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const history = db
    .prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC')
    .all(order.id);

  res.json({ order, items, history });
});

// ---- Admin/store endpoints ----

// GET /api/orders/admin/all - staff: list all orders (filter by status)
router.get('/admin/all', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const { status } = req.query;
  let orders;
  if (status) {
    orders = db
      .prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC')
      .all(status);
  } else {
    orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  }
  res.json({ orders });
});

// PUT /api/orders/:id/status - staff updates order status
router.put('/:id/status', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'حالة غير صحيحة' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

  db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(
    status,
    req.params.id
  );
  db.prepare(`INSERT INTO order_status_history (id, order_id, status) VALUES (?, ?, ?)`).run(
    uuidv4(),
    req.params.id,
    status
  );

  res.json({ order: db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) });
});

module.exports = router;
