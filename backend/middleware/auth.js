const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'admin' || decoded.role === 'owner') {
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin || !req.admin.isActive) {
        return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
      }
      req.user = null;
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ success: false, message: 'User not found or inactive' });
      }
      req.admin = null;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

/**
 * Role-based access control for admin routes
 */
const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

/**
 * User-only access control
 */
const userOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: 'User access required' });
  }
  next();
};

module.exports = { protect, adminOnly, userOnly };
