const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'hr', 'manager', 'employee'], default: 'employee' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

// Standar Mongoose Terbaru: Gunakan async function tanpa parameter 'next'
userSchema.pre('save', async function() {
  // Jika password tidak diubah (misal saat update profil biasa), lewati proses hash
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Tidak perlu panggil next(), Mongoose otomatis lanjut setelah fungsi selesai
  } catch (error) {
    throw new Error('Gagal mengenkripsi password: ' + error.message);
  }
});

module.exports = mongoose.model('User', userSchema);