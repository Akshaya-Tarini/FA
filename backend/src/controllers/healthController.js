const mongoose = require('mongoose');
const Student = require('../models/Student');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * GET /health
 * Health check endpoint — reports DB status and document count
 */
const getHealth = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const documentCount = dbState === 1 ? await Student.countDocuments() : 0;

  res.status(200).json({
    success: true,
    message: 'Database connected successfully',
    data: {
      database: stateMap[dbState] || 'unknown',
      documentCount,
    }
  });
});

module.exports = { getHealth };
