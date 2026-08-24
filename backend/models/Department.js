const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Contoh: Operasional, Keuangan
  code: { type: String, required: true, unique: true }, // Contoh: OPS, FIN
  headId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);