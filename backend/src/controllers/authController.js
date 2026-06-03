const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, role, studentId } = req.body;

    if (role === 'student') {
      const student = await Student.findOne({ email, studentId, status: 'active' });
      if (!student) {
        return res.status(400).json({
          success: false,
          message: 'Only active synced students can register',
        });
      }
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'student',
      studentId: role === 'student' ? studentId : undefined
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role === 'student') {
      const student = await Student.findOne({
        email: user.email,
        studentId: user.studentId,
        status: 'active',
      });

      if (!student) {
        return res.status(401).json({
          success: false,
          message: 'Student login is allowed only for active synced students',
        });
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, message: 'Authenticated user fetched successfully', data: user });
  } catch (err) {
    next(err);
  }
};
