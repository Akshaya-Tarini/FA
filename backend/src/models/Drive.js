const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  driveId: { type: String, required: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  mode: { type: String, required: true }, // e.g., online, offline
  location: { type: String },
  registrationDeadline: { type: Date, required: true },
  rounds: { type: [String], required: true },
  status: { type: String, default: 'open' }, // e.g., open, closed, ongoing
}, { timestamps: true });

module.exports = mongoose.model('Drive', driveSchema);
