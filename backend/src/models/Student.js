const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  cgpa: { type: Number, required: true },
  skills: { type: [String], default: [] },
  graduationYear: { type: Number, required: true },
  phone: { type: String },
  status: { type: String, default: 'active' }, // e.g., active, placed
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
