const express = require('express');
const { syncData } = require('../controllers/syncController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Based on requirements, only admin can perform sync/analytics
router.post('/', protect, authorize('admin'), syncData);

module.exports = router;
