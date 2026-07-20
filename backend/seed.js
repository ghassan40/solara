// seed.js - run with: npm run seed
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db/database');

console.log('🌱 Seeding database...');

// clear existing data (dev convenience)
db.exec(`
  DELETE FROM order_status_history;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM cart_items;
  DELETE FROM carts;
  DELETE FROM products;
  DELETE FROM categories;
  DELETE FROM addresses;
  DELETE FROM users;
`);

// --- Admin user ---
const adminId = uuidv4();
db.prepare(
  `INSERT INTO users (id, name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'admin')`
).run(adminId, 'مدير المتجر', '0500000000', 'admin@zawwid.app', bcrypt.hashSync('admin123', 10));

// --- Demo customer ---
const customerId = uuidv4();
db.prepare(
  `INSERT INTO users (id, name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'customer')`
).run(customerId, 'خالد التجريبي', '0511111111', 'khalid@example.com', bcrypt.hashSync('123456', 10));

// --- Categories ---
const categories = [
  { name_ar: 'فواكه وخضار', name_en: 'Fruits & Vegetables', icon: '🥦' },
  { name_ar: 'ألبان وبيض', name_en: 'Dairy & Eggs', icon: '🥛' },
  { name_ar: 'مشروبات', name_en: 'Beverages', icon: '🧃' },
  { name_ar: 'مخبوزات', name_en: 'Bakery', icon: '🍞' },
  { name_ar: 'سناكس وحلى', name_en: 'Snacks & Sweets', icon: '🍫' },
  { name_ar: 'العناية بالمنزل', name_en: 'Home Care', icon: '🧴' },
];

const catIds = {};
categories.forEach((c, i) => {
  const id = uuidv4();
  catIds[c.name_ar] = id;
  db.prepare(
    `INSERT INTO categories (id, name_ar, name_en, icon, sort_order) VALUES (?, ?, ?, ?, ?)`
  ).run(id, c.name_ar, c.name_en, c.icon, i);
});

// --- Products ---
const products = [
  { cat: 'فواكه وخضار', name_ar: 'موز', price: 6.5, unit: 'كيلو', stock: 40 },
  { cat: 'فواكه وخضار', name_ar: 'تفاح أحمر', price: 9.0, unit: 'كيلو', stock: 35 },
  { cat: 'فواكه وخضار', name_ar: 'طماطم', price: 4.5, unit: 'كيلو', stock: 60 },
  { cat: 'ألبان وبيض', name_ar: 'حليب طازج ١ لتر', price: 7.0, unit: 'علبة', stock: 50 },
  { cat: 'ألبان وبيض', name_ar: 'بيض ٣٠ حبة', price: 18.0, unit: 'كرتون', stock: 25 },
  { cat: 'ألبان وبيض', name_ar: 'جبن شرائح', price: 12.0, unit: 'عبوة', stock: 30 },
  { cat: 'مشروبات', name_ar: 'ماء معدني ٦ عبوات', price: 8.0, unit: 'عبوة', stock: 100 },
  { cat: 'مشروبات', name_ar: 'عصير برتقال', price: 6.0, unit: 'عبوة', stock: 45 },
  { cat: 'مخبوزات', name_ar: 'خبز توست', price: 5.5, unit: 'عبوة', stock: 20 },
  { cat: 'مخبوزات', name_ar: 'كرواسون', price: 3.0, unit: 'قطعة', stock: 4 },
  { cat: 'سناكس وحلى', name_ar: 'شوكولاتة', price: 4.0, unit: 'قطعة', stock: 70 },
  { cat: 'سناكس وحلى', name_ar: 'شيبس', price: 3.5, unit: 'قطعة', stock: 3 },
  { cat: 'العناية بالمنزل', name_ar: 'سائل غسيل أطباق', price: 9.5, unit: 'عبوة', stock: 30 },
  { cat: 'العناية بالمنزل', name_ar: 'مناديل ورقية', price: 11.0, unit: 'عبوة', stock: 40 },
];

products.forEach((p) => {
  db.prepare(
    `INSERT INTO products (id, category_id, name_ar, price, unit, stock_qty) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(uuidv4(), catIds[p.cat], p.name_ar, p.price, p.unit, p.stock);
});

console.log('✅ Seed complete.');
console.log('   Admin login  -> phone: 0500000000  password: admin123');
console.log('   Customer login -> phone: 0511111111  password: 123456');
