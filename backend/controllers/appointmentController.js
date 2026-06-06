const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM',
];

/**
 * Create notification helper
 */
const createNotification = async (userId, title, message, type, appointmentId) => {
  await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedAppointment: appointmentId,
  });
};

/**
 * @desc    Get available time slots for a date
 * @route   GET /api/appointments/slots
 */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date, staff } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved', 'rescheduled'] },
    };
    if (staff) query.staff = staff;

    const booked = await Appointment.find(query).select('timeSlot rescheduleTimeSlot status');
    const bookedSlots = booked.map((a) =>
      a.status === 'rescheduled' && a.rescheduleTimeSlot ? a.rescheduleTimeSlot : a.timeSlot
    );

    const available = TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    res.json({ success: true, data: { slots: available, allSlots: TIME_SLOTS } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book appointment (user)
 * @route   POST /api/appointments
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { serviceId, staff, date, timeSlot, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      service: serviceId,
      staff,
      date: new Date(date),
      timeSlot,
      notes,
      price: service.price,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('service', 'name price duration')
      .populate('user', 'name email');

    await createNotification(
      req.user._id,
      'Booking Submitted',
      `Your appointment for ${service.name} on ${new Date(date).toLocaleDateString()} at ${timeSlot} is pending approval.`,
      'booking',
      appointment._id
    );

    await sendEmail({
      to: req.user.email,
      subject: 'Appointment Confirmation - Glow & Grace Salon',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B6914;">Glow & Grace Salon</h2>
          <p>Dear ${req.user.name},</p>
          <p>Thank you for booking with us! Your appointment details:</p>
          <ul>
            <li><strong>Service:</strong> ${service.name}</li>
            <li><strong>Staff:</strong> ${staff}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${timeSlot}</li>
            <li><strong>Price:</strong> $${service.price}</li>
            <li><strong>Status:</strong> Pending Approval</li>
          </ul>
          <p>We will notify you once your booking is confirmed.</p>
          <p style="color: #888;">Glow & Grace Salon - Where Beauty Meets Elegance</p>
        </div>
      `,
    });

    appointment.emailSent = true;
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's appointments
 * @route   GET /api/appointments/my
 */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;

    let appointments = await Appointment.find(query)
      .populate('service', 'name price duration image')
      .sort({ date: -1 });

    if (search) {
      const term = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.service?.name?.toLowerCase().includes(term) ||
          a.staff?.toLowerCase().includes(term) ||
          a.status?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel appointment (user)
 * @route   PUT /api/appointments/:id/cancel
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('service', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (['cancelled', 'completed', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    await createNotification(
      req.user._id,
      'Appointment Cancelled',
      `Your ${appointment.service.name} appointment has been cancelled.`,
      'status',
      appointment._id
    );

    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments (admin)
 * @route   GET /api/appointments
 */
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status, search, date, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let appointments = await Appointment.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name price')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (search) {
      const term = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.user?.name?.toLowerCase().includes(term) ||
          a.user?.email?.toLowerCase().includes(term) ||
          a.service?.name?.toLowerCase().includes(term) ||
          a.staff?.toLowerCase().includes(term)
      );
    }

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status (admin)
 * @route   PUT /api/appointments/:id/status
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    if (adminNotes) appointment.adminNotes = adminNotes;
    await appointment.save();

    const statusMessages = {
      approved: 'Your appointment has been approved!',
      rejected: 'Your appointment has been declined.',
      completed: 'Your appointment has been marked as completed. Thank you!',
    };

    if (statusMessages[status]) {
      await createNotification(
        appointment.user._id,
        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `${appointment.service.name} on ${appointment.date.toLocaleDateString()} - ${statusMessages[status]}`,
        'status',
        appointment._id
      );

      await sendEmail({
        to: appointment.user.email,
        subject: `Appointment ${status} - Glow & Grace Salon`,
        html: `<p>Dear ${appointment.user.name},</p><p>${statusMessages[status]}</p>
               <p>Service: ${appointment.service.name}<br>Date: ${appointment.date.toLocaleDateString()}<br>Time: ${appointment.timeSlot}</p>`,
      });
    }

    res.json({ success: true, message: `Appointment ${status}`, data: appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule appointment (admin)
 * @route   PUT /api/appointments/:id/reschedule
 */
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { rescheduleDate, rescheduleTimeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.rescheduleDate = new Date(rescheduleDate);
    appointment.rescheduleTimeSlot = rescheduleTimeSlot;
    appointment.status = 'rescheduled';
    await appointment.save();

    await createNotification(
      appointment.user._id,
      'Appointment Rescheduled',
      `Your ${appointment.service.name} appointment has been rescheduled to ${new Date(rescheduleDate).toLocaleDateString()} at ${rescheduleTimeSlot}.`,
      'status',
      appointment._id
    );

    await sendEmail({
      to: appointment.user.email,
      subject: 'Appointment Rescheduled - Glow & Grace Salon',
      html: `<p>Dear ${appointment.user.name},</p>
             <p>Your appointment has been rescheduled:</p>
             <p>New Date: ${new Date(rescheduleDate).toLocaleDateString()}<br>New Time: ${rescheduleTimeSlot}</p>`,
    });

    res.json({ success: true, message: 'Appointment rescheduled', data: appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download appointments report (admin)
 * @route   GET /api/appointments/report/download
 */
exports.downloadReport = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const appointments = await Appointment.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name price')
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments-report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Glow & Grace Salon', { align: 'center' });
    doc.fontSize(14).text('Appointments Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
    doc.text(`Total Records: ${appointments.length}`);
    doc.moveDown();

    appointments.forEach((apt, i) => {
      doc.fontSize(11).text(`${i + 1}. ${apt.user?.name || 'N/A'} - ${apt.service?.name || 'N/A'}`);
      doc.fontSize(9).text(`   Date: ${apt.date.toLocaleDateString()} | Time: ${apt.timeSlot} | Status: ${apt.status} | $${apt.price}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dashboard stats (admin)
 * @route   GET /api/appointments/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalUsers, totalAppointments, todayAppointments, revenueData, recentAppointments] =
      await Promise.all([
        User.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({
          date: { $gte: today, $lt: tomorrow },
          status: { $in: ['pending', 'approved', 'rescheduled'] },
        }),
        Appointment.aggregate([
          { $match: { status: { $in: ['approved', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$price' } } },
        ]),
        Appointment.find()
          .populate('user', 'name')
          .populate('service', 'name')
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAppointments,
        todayAppointments,
        revenue: revenueData[0]?.total || 0,
        recentActivity: recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
