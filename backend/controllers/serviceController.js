const Service = require('../models/Service');

/**
 * @desc    Get all services (public)
 * @route   GET /api/services
 */
exports.getServices = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const services = await Service.find(query).sort({ name: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single service
 * @route   GET /api/services/:id
 */
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create service (admin)
 * @route   POST /api/services
 */
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update service (admin)
 * @route   PUT /api/services/:id
 */
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service updated', data: service });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete service (admin)
 * @route   DELETE /api/services/:id
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await service.deleteOne();
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all services including inactive (admin)
 * @route   GET /api/services/admin/all
 */
exports.getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};
