const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Define routes
app.use('/api/employees', require('./src/routes/employee.routes'));
app.use('/api/employee', require('./src/routes/employee-auth.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('HR System API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Có lỗi xảy ra trên máy chủ',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 