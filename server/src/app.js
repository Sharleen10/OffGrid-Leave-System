require('dotenv').config();
const express = require('express');
const cors = require('cors');

const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

/**
 * =========================
 * CORS CONFIG (PRODUCTION SAFE)
 * =========================
 */
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow tools like Postman or server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS blocked: Not allowed by server'));
    },
    credentials: true,
  })
);

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Leave Management API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * =========================
 * API ROUTES
 * =========================
 */
app.use('/api/leave', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);

/**
 * =========================
 * GLOBAL ERROR HANDLER
 * =========================
 */
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message || err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

/**
 * =========================
 * START SERVER
 * =========================
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: /health`);
  console.log(`🌍 FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
});