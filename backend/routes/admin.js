// routes/admin.js - dashboard stats for the admin panel
const express = require('express');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats - overview numbers for the dashboard home
router.get('/stats', requireAuth, requireRole('admin', 'store_manager'), (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) c FROM orders').get().c;
  const pendingOrders = db
    .prepare("SELECT COUNT(*) c FROM orders WHERE status NOT IN ('delivered','cancelled')")
    .get().c;
  const totalRevenue =
    db.prepare("SELECT COALESCE(SUM(total),0) s FROM orders WHERE status = 'delivered'").get()
      .s || 0;
  const totalCustomers = db.prepare("SELECT COUNT(*) c FROM users WHERE role = 'customer'").get()
    .c;
  const totalProducts = db.prepare('SELECT COUNT(*) c FROM products WHERE is_active = 1').get().c;
  const lowStock = db
    .prepare('SELECT id, name_ar, stock_qty FROM products WHERE is_active = 1 AND stock_qty <= 5 ORDER BY stock_qty ASC LIMIT 10')
    .all();

  const salesByDay = db
    .prepare(
      `SELECT date(created_at) as day, COUNT(*) as orders, COALESCE(SUM(total),0) as revenue
       FROM orders
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    )
    .all();

  res.json({
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalCustomers,
    totalProducts,
    lowStock,
    salesByDay,
  });
});

module.exports = router;
