const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: Number, required: true },
  eligibleDepartments: { type: [String], required: true },
  minCGPA: { type: Number, required: true },
  driveDate: { type: Date, required: true },
  status: { type: String, default: 'active' }, // e.g., active, completed
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
