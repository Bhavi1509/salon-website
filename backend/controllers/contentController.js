const Content = require('../models/Content');

/**
 * @desc    Get content by section (public)
 * @route   GET /api/content/:section
 */
exports.getContent = async (req, res, next) => {
  try {
    const contents = await Content.find({ section: req.params.section });
    const result = {};
    contents.forEach((c) => {
      result[c.key] = c.data;
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all content (admin)
 * @route   GET /api/content
 */
exports.getAllContent = async (req, res, next) => {
  try {
    const contents = await Content.find();
    res.json({ success: true, data: contents });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update or create content (admin)
 * @route   PUT /api/content
 */
exports.updateContent = async (req, res, next) => {
  try {
    const { key, section, data } = req.body;

    const content = await Content.findOneAndUpdate(
      { key },
      { section, data },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: 'Content updated', data: content });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit contact form
 * @route   POST /api/content/contact
 */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const sendEmail = require('../utils/sendEmail');

    await sendEmail({
      to: process.env.EMAIL_USER || 'admin@glowgrace.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true, message: 'Message sent successfully. We will get back to you soon!' });
  } catch (error) {
    next(error);
  }
};
