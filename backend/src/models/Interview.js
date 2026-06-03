const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  interviewId: { type: String, required: true, unique: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  interviewer: { type: String, required: true },
  round: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  result: { type: String, enum: ['pending', 'pass', 'fail'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
