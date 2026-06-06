const express = require('express');
const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  downloadReport,
  getDashboardStats,
} = require('../controllers/appointmentController');
const { protect, adminOnly, userOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/slots', getAvailableSlots);
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/report/download', protect, adminOnly, downloadReport);
router.get('/my', protect, userOnly, getMyAppointments);
router.post('/', protect, userOnly, createAppointment);
router.put('/:id/cancel', protect, userOnly, cancelAppointment);
router.get('/', protect, adminOnly, getAllAppointments);
router.put('/:id/status', protect, adminOnly, updateAppointmentStatus);
router.put('/:id/reschedule', protect, adminOnly, rescheduleAppointment);

module.exports = router;
