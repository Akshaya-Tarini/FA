const Student = require('../models/Student');

exports.getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};
    const { department, cgpaMin, status, studentId } = req.query;
    if (department) filter.department = department;
    if (cgpaMin) filter.cgpa = { $gte: Number(cgpaMin) };
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

;

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};
