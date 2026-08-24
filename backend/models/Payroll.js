const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  period: { type: String, required: true }, // Format: "2026-07"
  baseSalary: { type: Number, required: true },
  allowances: [{ name: String, amount: Number }],
  deductions: [{ name: String, amount: Number }],
  overtimePay: { type: Number, default: 0 },
  bpjsDeductions: { kesehatan: Number, ketenagakerjaan: Number },
  tax: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Calculated', 'Paid'], default: 'Draft' },
  paidDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);