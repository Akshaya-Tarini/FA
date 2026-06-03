const express = require('express');
const {
  createInterview,
  updateInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('admin', 'placement_officer'), createInterview);
router.patch('/:id', protect, authorize('admin', 'placement_officer'), updateInterview);

module.exports = router;
