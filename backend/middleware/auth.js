// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zawwid-dev-secret-change-me';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'يجب تسجيل الدخول' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, phone, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'الجلسة غير صالحة، سجّل الدخول مرة ثانية' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ما عندك صلاحية لهذا الإجراء' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };
