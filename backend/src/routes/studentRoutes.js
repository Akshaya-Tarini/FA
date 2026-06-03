const express = require('express');
const {
  getStudents,
  getStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getStudents);

router.route('/:id')
  .get(protect, getStudent);

module.exports = router;
