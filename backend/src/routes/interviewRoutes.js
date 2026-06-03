const express = require('express');
const {
  createInterview,
  getInterviews,
  updateInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getInterviews)
  .post(protect, authorize('admin', 'placement_officer'), createInterview);

router.route('/:id')
  .patch(protect, authorize('admin', 'placement_officer'), updateInterview);

module.exports = router;
