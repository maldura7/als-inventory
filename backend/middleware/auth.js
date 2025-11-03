const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/inventory.db');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const db = new Database(dbPath);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    db.close();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;