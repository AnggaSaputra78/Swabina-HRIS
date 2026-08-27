const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, default: '-' },
  type: { type: String, default: 'Full Time' },
  salary: { type: String, default: '-' },
  deadline: { type: Date },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Terbuka', 'Ditutup'], default: 'Terbuka' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);