const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '-' },
  position: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Baru', 'Screening', 'Interview', 'Offering', 'Diterima', 'Ditolak'],
    default: 'Baru',
  },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);