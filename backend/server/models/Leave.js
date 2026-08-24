import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  nik: String,
  dept: String,
  type: { type: String, required: true }, // Cuti Tahunan, Sakit, Melahirkan, dll
  startDate: String,
  endDate: String,
  duration: String,
  reason: String,
  status: { type: String, enum: ['Pending', 'Disetujui', 'Ditolak'], default: 'Pending' },
  avatar: String,
  avatarBg: String,
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);