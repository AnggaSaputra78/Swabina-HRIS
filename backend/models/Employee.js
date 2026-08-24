const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true }, // SWG-0184
  fullName: { type: String, required: true },
  nik: String,
  birthDate: Date,
  gender: { type: String, enum: ['L', 'P'] },
  address: String,
  phone: String,
  email: { type: String, unique: true }, // Email kantor
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  joinDate: { type: Date, required: true },
  status: { type: String, enum: ['Tetap', 'Kontrak', 'Magang', 'Resign'], default: 'Kontrak' },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  photoUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);