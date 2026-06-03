const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware');
const { getMe } = require('./controllers/authController');

// Route imports
const authRoutes = require('./routes/authRoutes');
const syncRoutes = require('./routes/syncRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const driveRoutes = require('./routes/driveRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', authRoutes);
app.use('/auth', authRoutes);
app.get('/auth/me', protect, getMe);
app.get('/api/auth/me', protect, getMe);
app.use('/health', healthRoutes);

// Sync
app.use('/api/sync', syncRoutes);

// Entities
app.use('/students', studentRoutes);
app.use('/companies', companyRoutes);
app.use('/drives', driveRoutes);
app.use('/applications', applicationRoutes);
app.use('/interviews', interviewRoutes);

// API-prefixed aliases for frontend and API clients
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);

// Analytics
app.use('/analytics', analyticsRoutes);
app.use('/api/analytics', analyticsRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Placement Recruitment Management API is running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
