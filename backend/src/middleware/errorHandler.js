/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate record detected',
    });
  }

  // Axios errors (from external API calls)
  if (err.response) {
    return res.status(err.response.status || 502).json({
      success: false,
      message: err.response.data?.message || 'External API error',
    });
  }

  // Generic server error
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
