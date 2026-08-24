const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // PENTING: Baca process.env DI DALAM fungsi, bukan di luar!
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI tidak ditemukan. Pastikan .env terbaca.');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;