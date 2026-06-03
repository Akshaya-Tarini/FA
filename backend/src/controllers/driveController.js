// Drive Controller – updated to match SetA contract
const Drive = require('../models/Drive');
const Company = require('../models/Company');

// Create Drive
exports.createDrive = async (req, res, next) => {
  try {
    const drive = await Drive.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      data: drive,
    });
  } catch (err) {
    next(err);
  }
};

// Get Drives – pagination & optional filters
exports.getDrives = async (req, res, next) => {
  try {
    const { company, status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let query = {};
    if (company) {
      const companies = await Company.find({ name: { $regex: company, $options: 'i' } });
      const companyIds = companies.map(c => c._id);
      query.company = { $in: companyIds };
    }
    if (status) query.status = status;
    const total = await Drive.countDocuments(query);
    const drives = await Drive.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('company');
    res.status(200).json({
      success: true,
      message: 'Drives fetched successfully',
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: drives,
    });
  } catch (err) {
    next(err);
  }
};

// Get single Drive
exports.getDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('company');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Drive fetched successfully',
      data: drive,
    });
  } catch (err) {
    next(err);
  }
};

// Update Drive
exports.updateDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Drive updated successfully',
      data: drive,
    });
  } catch (err) {
    next(err);
  }
};

// Delete Drive
exports.deleteDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Drive deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
