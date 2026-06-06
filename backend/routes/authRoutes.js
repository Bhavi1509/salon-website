const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  loginAdmin,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/admin/login', loginValidation, loginAdmin);
router.post('/forgot-password', body('email').isEmail(), forgotPassword);
router.put('/reset-password/:token', body('password').isLength({ min: 6 }), resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
