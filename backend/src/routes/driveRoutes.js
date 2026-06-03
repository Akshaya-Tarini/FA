const express = require('express');
const {
  createDrive,
  getDrives,
  getDrive,
  updateDrive,
  deleteDrive
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'placement_officer'), createDrive)
  .get(protect, getDrives);

router.route('/:id')
  .get(protect, getDrive)
  .patch(protect, authorize('admin', 'placement_officer'), updateDrive)
  .delete(protect, authorize('admin', 'placement_officer'), deleteDrive);

module.exports = router;
