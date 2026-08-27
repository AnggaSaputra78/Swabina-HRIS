const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// LOAD .ENV DARI FOLDER ROOT
// ==========================================
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging setiap request
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

// ==========================================
// KONEKSI DATABASE
// ==========================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

// ==========================================
// SEMUA MODELS (DIPUSATKAN DI SINI)
// ==========================================

// 1. User Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Employee Model
const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  department: String,
  position: String,
  status: { type: String, default: 'Aktif' },
  joinDate: Date,
}, { timestamps: true });
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

// 3. Attendance Model
const attendanceSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  date: Date,
  checkIn: String,
  checkOut: String,
  status: { type: String, default: 'Hadir' },
  notes: String,
}, { timestamps: true });
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

// 4. Leave Model
const leaveSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  type: String,
  startDate: Date,
  endDate: Date,
  reason: String,
  status: { type: String, default: 'Pending' },
}, { timestamps: true });
const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);

// 5. Job Model (Rekrutmen)
const jobSchema = new mongoose.Schema({
  title: String,
  department: String,
  location: String,
  type: String,
  salary: String,
  deadline: Date,
  description: String,
  status: { type: String, default: 'Terbuka' },
}, { timestamps: true });
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// 6. Candidate Model (Rekrutmen)
const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  position: String,
  status: { type: String, default: 'Baru' },
}, { timestamps: true });
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

// 7. Payroll Model (Penggajian) — ✨ BARU
const payrollSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  position: String,
  department: String,
  month: String,
  basicSalary: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['Dibayar', 'Belum Dibayar'], default: 'Belum Dibayar' },
}, { timestamps: true });
const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

// ==========================================
// MIDDLEWARE AUTH
// ==========================================
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// ==========================================
// ROUTE: HEALTH CHECK
// ==========================================
app.get('/', (req, res) => res.send('HRIS SWABINA Backend OK'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend hidup' }));

// ==========================================
// ROUTE: AUTH (LOGIN/REGISTER)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '7d' }
    );
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ROUTE: EMPLOYEES (KARYAWAN)
// ==========================================
app.get('/api/employees', async (req, res) => {
  try {
    const { search, dept, status } = req.query;
    const query = {};
    
    if (search) query.name = { $regex: search, $options: 'i' };
    if (dept && dept !== 'Semua') query.department = dept;
    if (status && status !== 'Semua') query.status = status;
    
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ROUTE: ATTENDANCE (ABSENSI)
// ==========================================
app.get('/api/attendance', async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const query = {};
    
    if (date) query.date = new Date(date);
    if (status && status !== 'Semua') query.status = status;
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/attendance/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const total = await Attendance.countDocuments({ date: today });
    const hadir = await Attendance.countDocuments({ date: today, status: 'Hadir' });
    const terlambat = await Attendance.countDocuments({ date: today, status: 'Terlambat' });
    const izin = await Attendance.countDocuments({ date: today, status: 'Izin' });
    
    res.json({ total, hadir, terlambat, izin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ROUTE: LEAVES (CUTI)
// ==========================================
app.get('/api/leaves', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};
    
    if (status && status !== 'Semua') query.status = status;
    if (type && type !== 'Semua') query.type = type;
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/leaves/stats', async (req, res) => {
  try {
    const total = await Leave.countDocuments();
    const pending = await Leave.countDocuments({ status: 'Pending' });
    const approved = await Leave.countDocuments({ status: 'Approved' });
    const rejected = await Leave.countDocuments({ status: 'Rejected' });
    
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ROUTE: DASHBOARD
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Aktif' });
    const onLeave = await Leave.countDocuments({ status: 'Approved' });
    
    res.json({
      totalEmployees,
      activeEmployees,
      onLeave,
      departments: 5,
    });
  } catch (error) {
    res.json({ totalEmployees: 0, activeEmployees: 0, onLeave: 0, departments: 0 });
  }
});

app.get('/api/dashboard/activities', async (req, res) => {
  try {
    res.json([
      { user: 'Admin', action: 'Login', time: '2 menit lalu' },
      { user: 'System', action: 'Backup Database', time: '1 jam lalu' }
    ]);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/dashboard/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 }).limit(5);
    res.json(leaves);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/dashboard/announcements', async (req, res) => {
  res.json([
    { title: 'Libur Nasional', desc: 'Tanggal 17 Agustus kantor libur' },
    { title: 'Meeting Bulanan', desc: 'Meeting seluruh karyawan hari Jumat' }
  ]);
});

// ==========================================
// ROUTE: REKRUTMEN
// ==========================================
app.get('/api/recruitment/jobs', async (req, res) => {
  res.json(await Job.find().sort({ createdAt: -1 }));
});

app.post('/api/recruitment/jobs', async (req, res) => {
  try {
    res.status(201).json(await Job.create(req.body));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/recruitment/jobs/:id', async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'deleted' });
});

app.get('/api/recruitment/candidates', async (req, res) => {
  res.json(await Candidate.find().sort({ createdAt: -1 }));
});

app.post('/api/recruitment/candidates', async (req, res) => {
  try {
    res.status(201).json(await Candidate.create(req.body));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/recruitment/candidates/:id', async (req, res) => {
  res.json(await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/recruitment/candidates/:id', async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ message: 'deleted' });
});

// ==========================================
// ROUTE: PAYROLL (PENGAJIAN) — ✨ BARU
// ==========================================
app.get('/api/payroll', async (req, res) => {
  try {
    const { month, status, search } = req.query;
    const query = {};
    
    if (month) query.month = month;
    if (status && status !== 'Semua') query.status = status;
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    
    const payroll = await Payroll.find(query).sort({ createdAt: -1 });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/payroll/stats', async (req, res) => {
  try {
    const total = await Payroll.countDocuments();
    const paid = await Payroll.countDocuments({ status: 'Dibayar' });
    const unpaid = await Payroll.countDocuments({ status: 'Belum Dibayar' });
    
    const agg = await Payroll.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$total' } } },
    ]);
    
    res.json({
      total,
      paid,
      unpaid,
      totalAmount: agg[0]?.totalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/payroll', async (req, res) => {
  try {
    const data = { ...req.body };
    // Auto hitung total: gaji pokok + tunjangan - potongan
    data.total = (Number(data.basicSalary) || 0) +
                 (Number(data.allowances) || 0) -
                 (Number(data.deductions) || 0);
    
    const payroll = await Payroll.create(data);
    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/payroll/:id', async (req, res) => {
  try {
    // Jika update total, hitung ulang
    if (req.body.basicSalary !== undefined || req.body.allowances !== undefined || req.body.deductions !== undefined) {
      const existing = await Payroll.findById(req.params.id);
      if (existing) {
        req.body.total = (Number(req.body.basicSalary ?? existing.basicSalary) || 0) +
                         (Number(req.body.allowances ?? existing.allowances) || 0) -
                         (Number(req.body.deductions ?? existing.deductions) || 0);
      }
    }
    
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/payroll/:id', async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ERROR HANDLER (WAJIB DI PALING BAWAH)
// ==========================================
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ message: err.message });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Test: http://localhost:${PORT}/api/health`);
    console.log(`📝 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`📝 Employees: http://localhost:${PORT}/api/employees`);
    console.log(`💰 Payroll: http://localhost:${PORT}/api/payroll`);
  });
});