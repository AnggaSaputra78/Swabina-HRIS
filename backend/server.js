const path = require('path');
const express = require('express');
const cors = require('cors');

// 1. Load dotenv DULU sebelum require file lain yang butuh env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// 2. Baru require config DB dan file lainnya
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi Database
connectDB();

// === ROUTES ===
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/employees', require('./routes/employeeRoutes'));

// Route dasar
app.get('/', (req, res) => {
  res.send('HRIS SWABINA Backend is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});