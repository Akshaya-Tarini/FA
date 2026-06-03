const express = require('express');
const {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'placement_officer', 'student'), createApplication)
  .get(protect, getApplications);

router.route('/:id')
  .get(protect, getApplication)
  .patch(protect, authorize('admin', 'placement_officer'), updateApplication)
  .delete(protect, authorize('admin', 'placement_officer'), deleteApplication);

module.exports = router;
