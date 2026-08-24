import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  nik:    { type: String, required: true, unique: true },
  name:   { type: String, required: true },
  role:   { type: String, required: true },
  dept:   { type: String, required: true },
  status: { type: String, enum: ['Aktif', 'Cuti', 'Non-Aktif'], default: 'Aktif' },
  email:  { type: String, required: true },
  phone:  String,
  joinDate: String,
  salary: Number,
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);