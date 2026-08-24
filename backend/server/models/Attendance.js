import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  nik: String,
  dept: String,
  date: { type: String, required: true },
  clockIn: String,
  clockOut: String,
  status: { type: String, enum: ['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpha'], default: 'Hadir' },
  note: String,
  avatar: String,
  avatarBg: String,
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);