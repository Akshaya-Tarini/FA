const express = require('express');
const {
  getPlacementAnalytics,
  getDepartmentAnalytics,
  getCompanyAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure only admin or placement officer can access analytics
router.use(protect);
router.use(authorize('admin', 'placement_officer'));

router.get('/placements', getPlacementAnalytics);
router.get('/departments', getDepartmentAnalytics);
router.get('/companies', getCompanyAnalytics);

module.exports = router;
