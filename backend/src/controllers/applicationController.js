const Application = require('../models/Application');
const Drive = require('../models/Drive');

exports.createApplication = async (req, res, next) => {
  try {
    // If user is a student, enforce their student ID
    if (req.user && req.user.role === 'student' && req.user.studentId) {
      // Need to find the Student ObjectId based on studentId
      const Student = require('../models/Student');
      const student = await Student.findOne({ studentId: req.user.studentId });
      if (student) {
        req.body.student = student._id;
      }
    }
    
    const application = await Application.create(req.body);
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Search (Assuming search applies to Drive title or company name)
    const search = req.query.search;
    let query = {};

    if (search) {
      const drives = await Drive.find({ title: { $regex: search, $options: 'i' } });
      const driveIds = drives.map(d => d._id);
      
      // Additional check for company name
      const Company = require('../models/Company');
      const companies = await Company.find({ name: { $regex: search, $options: 'i' } });
      const companyIds = companies.map(c => c._id);
      const companyDrives = await Drive.find({ company: { $in: companyIds } });
      companyDrives.forEach(d => driveIds.push(d._id));
      
      query.drive = { $in: driveIds };
    }
    
    // If student, only show their own applications
    if (req.user && req.user.role === 'student' && req.user.studentId) {
      const Student = require('../models/Student');
      const student = await Student.findOne({ studentId: req.user.studentId });
      if (student) {
        query.student = student._id;
      }
    }

    const applications = await Application.find(query)
      .populate('student')
      .populate({ path: 'drive', populate: { path: 'company' } })
      .skip(skip)
      .limit(limit);
      
    const total = await Application.countDocuments(query);

    res.json({ 
      success: true, 
      count: applications.length, 
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: applications 
    });
  } catch (err) {
    next(err);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student')
      .populate('drive');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
