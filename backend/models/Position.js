const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Contoh: Area Supervisor
  level: { type: String, enum: ['Staff', 'Supervisor', 'Manager', 'Head'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  minSalary: Number,
  maxSalary: Number
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);