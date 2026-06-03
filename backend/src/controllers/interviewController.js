const Interview = require('../models/Interview');
const Application = require('../models/Application');

exports.createInterview = async (req, res, next) => {
  try {
    const { application, scheduledAt } = req.body;
    
    const appExists = await Application.findById(application);
    if (!appExists) {
      return res.status(400).json({ success: false, message: 'Applicant/Application must exist' });
    }
    
    if (new Date(scheduledAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Interview date must be valid (in the future)' });
    }

    const interview = await Interview.create(req.body);
    res.status(201).json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

exports.getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate({ path: 'application', populate: [ { path: 'student' }, { path: 'drive', populate: { path: 'company' } } ] });
    res.json({ success: true, data: interviews });
  } catch (err) {
    next(err);
  }
};

exports.updateInterview = async (req, res, next) => {
  try {
    const { result } = req.body;
    
    if (result && !['pending', 'pass', 'fail'].includes(result)) {
      return res.status(400).json({ success: false, message: 'Allowed results: pending, pass, fail' });
    }

    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};
