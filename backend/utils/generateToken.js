const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated users/admins
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
