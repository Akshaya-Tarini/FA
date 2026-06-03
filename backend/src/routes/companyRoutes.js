const express = require('express');
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'placement_officer'), createCompany)
  .get(protect, getCompanies);

router.route('/:id')
  .get(protect, getCompany)
  .patch(protect, authorize('admin', 'placement_officer'), updateCompany)
  .delete(protect, authorize('admin', 'placement_officer'), deleteCompany);

module.exports = router;
