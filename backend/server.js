const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📨 ${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

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
// SEMUA MODELS
// ==========================================
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'user' },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const employeeSchema = new mongoose.Schema({
  name: String, email: String, phone: String,
  department: String, dept: String,
  position: String, role: String,
  nik: String,
  salary: { type: Number, default: 0 },
  status: { type: String, default: 'Aktif' },
  joinDate: Date,
}, { timestamps: true });
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

const attendanceSchema = new mongoose.Schema({
  employeeId: String, employeeName: String, date: Date,
  checkIn: String, checkOut: String,
  status: { type: String, default: 'Hadir' }, notes: String,
}, { timestamps: true });
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

const leaveSchema = new mongoose.Schema({
  employeeId: String, employeeName: String, type: String,
  startDate: Date, endDate: Date, reason: String,
  duration: String,
  status: { type: String, default: 'Pending' },
}, { timestamps: true });
const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);

const jobSchema = new mongoose.Schema({
  title: String, department: String, location: String, type: String,
  salary: String, deadline: Date, description: String,
  status: { type: String, default: 'Terbuka' },
}, { timestamps: true });
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

const candidateSchema = new mongoose.Schema({
  name: String, email: String, phone: String, position: String,
  status: { type: String, default: 'Baru' },
}, { timestamps: true });
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

const payrollSchema = new mongoose.Schema({
  employeeId: String, employeeName: String, position: String, department: String,
  month: String, basicSalary: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 }, deductions: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['Dibayar', 'Belum Dibayar'], default: 'Belum Dibayar' },
}, { timestamps: true });
const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

const activitySchema = new mongoose.Schema({
  name: String, avatar: String, avatarBg: String,
  activity: String, module: String, moduleColor: String, time: String,
}, { timestamps: true });
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

const announcementSchema = new mongoose.Schema({
  title: String, date: String, tag: String, tagColor: String,
}, { timestamps: true });
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

// ==========================================
// 🏢 MODEL DEPARTEMEN (BARU)
// ==========================================
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: String,
  manager: String,
  location: String,
  description: String,
  color: String,
}, { timestamps: true });
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

// ==========================================
// SEED DATA DUMMY (sekali saja jika kosong)
// ==========================================
async function seedIfEmpty() {
  if (await Activity.countDocuments() === 0) {
    const activities = [
      { name: 'Budi Santoso', avatar: 'BS', avatarBg: 'bg-blue-100 text-blue-700', activity: 'Login ke sistem', module: 'Auth', moduleColor: 'bg-sky-100 text-sky-700', time: '2 menit lalu' },
      { name: 'Siti Aminah', avatar: 'SA', avatarBg: 'bg-emerald-100 text-emerald-700', activity: 'Mengajukan cuti tahunan', module: 'Cuti', moduleColor: 'bg-amber-100 text-amber-700', time: '15 menit lalu' },
      { name: 'Ahmad Rizki', avatar: 'AR', avatarBg: 'bg-purple-100 text-purple-700', activity: 'Absen masuk', module: 'Absensi', moduleColor: 'bg-emerald-100 text-emerald-700', time: '1 jam lalu' },
      { name: 'Dewi Lestari', avatar: 'DL', avatarBg: 'bg-rose-100 text-rose-700', activity: 'Update data karyawan', module: 'Karyawan', moduleColor: 'bg-blue-100 text-blue-700', time: '2 jam lalu' },
      { name: 'System', avatar: 'SY', avatarBg: 'bg-slate-100 text-slate-700', activity: 'Backup database otomatis', module: 'System', moduleColor: 'bg-slate-100 text-slate-700', time: '3 jam lalu' },
    ];
    await Activity.insertMany(activities);
  }
  if (await Announcement.countDocuments() === 0) {
    const anns = [
      { title: 'Libur Nasional 17 Agustus', date: '17 Agustus 2026', tag: 'Libur', tagColor: 'bg-rose-100 text-rose-700' },
      { title: 'Meeting Bulanan Seluruh Karyawan', date: '25 Agustus 2026', tag: 'Meeting', tagColor: 'bg-blue-100 text-blue-700' },
      { title: 'Perubahan Jam Kerja Efektif 1 Sept', date: '1 September 2026', tag: 'Info', tagColor: 'bg-amber-100 text-amber-700' },
    ];
    await Announcement.insertMany(anns);
  }
}

// Seed departemen default (BARU)
async function seedDepartments() {
  if (await Department.countDocuments() === 0) {
    await Department.insertMany([
      { name: 'HRD', code: 'HR-01', manager: 'Rizky Pratama', location: 'Lantai 2', description: 'Human Resource Development', color: 'bg-blue-100 text-blue-700' },
      { name: 'IT', code: 'IT-01', manager: 'Budi Santoso', location: 'Lantai 3', description: 'Information Technology', color: 'bg-purple-100 text-purple-700' },
      { name: 'Finance', code: 'FN-01', manager: 'Siti Aminah', location: 'Lantai 1', description: 'Keuangan & Akuntansi', color: 'bg-emerald-100 text-emerald-700' },
      { name: 'Marketing', code: 'MK-01', manager: 'Dewi Lestari', location: 'Lantai 2', description: 'Pemasaran & Sales', color: 'bg-orange-100 text-orange-700' },
      { name: 'Operasional', code: 'OP-01', manager: 'Ahmad Rizki', location: 'Lantai 1', description: 'Operasional harian perusahaan', color: 'bg-sky-100 text-sky-700' },
    ]);
  }
}

// ==========================================
// MIDDLEWARE AUTH
// ==========================================
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// ==========================================
// HELPER: Avatar
// ==========================================
const getAvatar = (name) => {
  if (!name) return { avatar: '?', avatarBg: 'bg-slate-100 text-slate-700' };
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700',
  ];
  const colorIndex = name.length % colors.length;
  return { avatar: initials, avatarBg: colors[colorIndex] };
};

// ==========================================
// HEALTH & AUTH
// ==========================================
app.get('/', (req, res) => res.send('HRIS SWABINA Backend OK'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email tidak ditemukan' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password salah' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key', { expiresIn: '7d' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email sudah terdaftar' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key', { expiresIn: '7d' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// EMPLOYEES (lengkap untuk dashboard)
// ==========================================
app.get('/api/employees', async (req, res) => {
  try {
    const { search, dept, status } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (dept && dept !== 'Semua') query.$or = [{ department: dept }, { dept: dept }];
    if (status && status !== 'Semua') query.status = status;
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    const formatted = employees.map(e => ({
      _id: e._id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      dept: e.dept || e.department || 'Umum',
      department: e.department || e.dept || 'Umum',
      role: e.role || e.position || 'Staff',
      position: e.position,
      nik: e.nik || `NIK${String(e._id).slice(-6).toUpperCase()}`,
      salary: e.salary || 0,
      status: e.status || 'Aktif',
      joinDate: e.joinDate,
      createdAt: e.createdAt,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try { res.status(201).json(await Employee.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/employees/:id', async (req, res) => {
  try { res.json(await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/employees/:id', async (req, res) => {
  try { await Employee.findByIdAndDelete(req.params.id); res.json({ message: 'deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ==========================================
// ATTENDANCE
// ==========================================
app.get('/api/attendance', async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const query = {};
    if (date) query.date = new Date(date);
    if (status && status !== 'Semua') query.status = status;
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    res.json(await Attendance.find(query).sort({ date: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.get('/api/attendance/stats', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const total = await Attendance.countDocuments({ date: today });
    const hadir = await Attendance.countDocuments({ date: today, status: 'Hadir' });
    res.json({ total, hadir, terlambat: 0, izin: 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/attendance', async (req, res) => {
  try { res.status(201).json(await Attendance.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ==========================================
// LEAVES (untuk dashboard + approval)
// ==========================================
app.get('/api/leaves', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};
    if (status && status !== 'Semua') query.status = status;
    if (type && type !== 'Semua') query.type = type;
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    const formatted = leaves.map(l => {
      const av = getAvatar(l.employeeName);
      let duration = l.duration;
      if (!duration && l.startDate && l.endDate) {
        const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000*60*60*24)) + 1;
        duration = `${days} hari`;
      }
      return {
        _id: l._id, employeeId: l.employeeId, employeeName: l.employeeName,
        type: l.type || 'Cuti', startDate: l.startDate, endDate: l.endDate,
        reason: l.reason, status: l.status, duration: duration || '-',
        avatar: av.avatar, avatarBg: av.avatarBg,
        createdAt: l.createdAt,
      };
    });
    res.json(formatted);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/leaves/stats', async (req, res) => {
  try {
    res.json({
      total: await Leave.countDocuments(),
      pending: await Leave.countDocuments({ status: 'Pending' }),
      approved: await Leave.countDocuments({ status: { $in: ['Approved', 'Disetujui'] } }),
      rejected: await Leave.countDocuments({ status: { $in: ['Rejected', 'Ditolak'] } }),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/leaves', async (req, res) => {
  try { res.status(201).json(await Leave.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leave) return res.status(404).json({ message: 'Leave tidak ditemukan' });
    res.json(leave);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/leaves/:id', async (req, res) => {
  try { await Leave.findByIdAndDelete(req.params.id); res.json({ message: 'deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ==========================================
// PAYROLL
// ==========================================
app.get('/api/payroll', async (req, res) => {
  try {
    const { month, status, search } = req.query;
    const query = {};
    if (month) query.month = month;
    if (status && status !== 'Semua') query.status = status;
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    res.json(await Payroll.find(query).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.get('/api/payroll/stats', async (req, res) => {
  try {
    const total = await Payroll.countDocuments();
    const paid = await Payroll.countDocuments({ status: 'Dibayar' });
    const unpaid = await Payroll.countDocuments({ status: 'Belum Dibayar' });
    const agg = await Payroll.aggregate([{ $group: { _id: null, totalAmount: { $sum: '$total' } } }]);
    res.json({ total, paid, unpaid, totalAmount: agg[0]?.totalAmount || 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/payroll', async (req, res) => {
  try {
    const data = { ...req.body };
    data.total = (Number(data.basicSalary)||0) + (Number(data.allowances)||0) - (Number(data.deductions)||0);
    res.status(201).json(await Payroll.create(data));
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/payroll/:id', async (req, res) => {
  res.json(await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
app.delete('/api/payroll/:id', async (req, res) => {
  await Payroll.findByIdAndDelete(req.params.id);
  res.json({ message: 'deleted' });
});

// ==========================================
// REKRUTMEN
// ==========================================
app.get('/api/recruitment/jobs', async (req, res) => res.json(await Job.find().sort({ createdAt: -1 })));
app.post('/api/recruitment/jobs', async (req, res) => {
  try { res.status(201).json(await Job.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/recruitment/jobs/:id', async (req, res) => { await Job.findByIdAndDelete(req.params.id); res.json({ message: 'deleted' }); });
app.get('/api/recruitment/candidates', async (req, res) => res.json(await Candidate.find().sort({ createdAt: -1 })));
app.post('/api/recruitment/candidates', async (req, res) => {
  try { res.status(201).json(await Candidate.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/recruitment/candidates/:id', async (req, res) => res.json(await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/recruitment/candidates/:id', async (req, res) => { await Candidate.findByIdAndDelete(req.params.id); res.json({ message: 'deleted' }); });

// ==========================================
// 🏢 DEPARTEMEN (BARU - REALTIME)
// ==========================================
app.get('/api/departments', async (req, res) => {
  try {
    await seedDepartments();
    const employees = await Employee.find({}, { dept: 1, department: 1 });
    const countMap = {};
    employees.forEach(e => {
      const d = e.dept || e.department || 'Umum';
      countMap[d] = (countMap[d] || 0) + 1;
    });
    const departments = await Department.find().sort({ createdAt: 1 });
    res.json(departments.map(d => ({
      ...d.toObject(),
      employeeCount: countMap[d.name] || 0,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/departments/stats', async (req, res) => {
  try {
    const totalDepartments = await Department.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const avg = totalDepartments ? Math.round(totalEmployees / totalDepartments) : 0;

    const employees = await Employee.find({}, { dept: 1, department: 1 });
    const countMap = {};
    employees.forEach(e => {
      const d = e.dept || e.department || 'Umum';
      countMap[d] = (countMap[d] || 0) + 1;
    });
    let largest = '-'; let max = 0;
    Object.entries(countMap).forEach(([name, count]) => {
      if (count > max) { max = count; largest = name; }
    });

    res.json({ totalDepartments, totalEmployees, avg, largest });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/departments/:id/employees', async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Departemen tidak ditemukan' });
    const list = await Employee.find({ $or: [{ dept: dept.name }, { department: dept.name }] });
    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/departments', async (req, res) => {
  try { res.status(201).json(await Department.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/departments/:id', async (req, res) => {
  try { res.json(await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/departments/:id', async (req, res) => {
  try { await Department.findByIdAndDelete(req.params.id); res.json({ message: 'deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ==========================================
// 🎯 DASHBOARD (REALTIME DARI MONGODB)
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Aktif' });
    const onLeave = await Employee.countDocuments({ status: 'Cuti' });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    const salaryAgg = await Payroll.aggregate([
      { $match: { status: 'Dibayar' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalSalary = salaryAgg[0]?.total || 0;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const totalAttToday = await Attendance.countDocuments({ date: today });
    const hadirToday = await Attendance.countDocuments({ date: today, status: 'Hadir' });
    let attendanceRate = 0;
    if (totalAttToday > 0) {
      attendanceRate = Math.round((hadirToday / totalAttToday) * 100);
    }

    res.json({
      totalEmployees, activeEmployees, onLeave,
      pendingLeaves, totalSalary, attendanceRate,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({
      totalEmployees: 0, activeEmployees: 0, onLeave: 0,
      pendingLeaves: 0, totalSalary: 0, attendanceRate: 0,
    });
  }
});

app.get('/api/dashboard/activities', async (req, res) => {
  try {
    await seedIfEmpty();
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
    res.json(activities);
  } catch (e) { res.json([]); }
});

app.get('/api/dashboard/announcements', async (req, res) => {
  try {
    await seedIfEmpty();
    res.json(await Announcement.find().sort({ createdAt: -1 }));
  } catch (e) { res.json([]); }
});

app.get('/api/dashboard/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(5);
    const formatted = leaves.map(l => {
      const av = getAvatar(l.employeeName);
      let duration = l.duration;
      if (!duration && l.startDate && l.endDate) {
        const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000*60*60*24)) + 1;
        duration = `${days} hari`;
      }
      return {
        _id: l._id, employeeName: l.employeeName, type: l.type || 'Cuti',
        duration: duration || '-', status: l.status,
        avatar: av.avatar, avatarBg: av.avatarBg,
      };
    });
    res.json(formatted);
  } catch (e) { res.json([]); }
});
// ==========================================
// MODEL KINERJA (PERFORMANCE REVIEW)
// ==========================================
const performanceSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  nik: String,
  dept: String,
  position: String,
  avatar: String,
  avatarBg: String,
  period: String,        // "Q1 2026", "Q2 2026", dll
  reviewer: String,      // Nama atasan/reviewer
  reviewDate: Date,
  // Metrics (skala 1-5)
  quality: { type: Number, default: 3 },        // Kualitas Kerja
  productivity: { type: Number, default: 3 },   // Produktivitas
  teamwork: { type: Number, default: 3 },       // Kerjasama Tim
  initiative: { type: Number, default: 3 },     // Inisiatif
  discipline: { type: Number, default: 3 },     // Kedisiplinan
  // Computed
  totalScore: { type: Number, default: 0 },     // Skala 0-100
  category: { type: String, default: 'Average' },
  // Feedback
  strengths: String,
  improvements: String,
  feedback: String,
  // Status
  status: { type: String, enum: ['Draft', 'Submitted', 'Reviewed'], default: 'Draft' },
}, { timestamps: true });
const Performance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);

// Helper hitung skor & kategori
function calculateScore(metrics) {
  const avg = (
    (Number(metrics.quality) || 0) +
    (Number(metrics.productivity) || 0) +
    (Number(metrics.teamwork) || 0) +
    (Number(metrics.initiative) || 0) +
    (Number(metrics.discipline) || 0)
  ) / 5;
  const totalScore = Math.round(avg * 20); // Skala 0-100
  let category = 'Poor';
  if (totalScore >= 90) category = 'Excellent';
  else if (totalScore >= 75) category = 'Good';
  else if (totalScore >= 60) category = 'Average';
  return { totalScore, category };
}

// Seed data kinerja sample
async function seedPerformance() {
  if (await Performance.countDocuments() === 0) {
    const employees = await Employee.find().limit(5);
    const periods = ['Q1 2026', 'Q2 2026'];
    const samples = [];
    employees.forEach((emp, i) => {
      const av = getAvatar(emp.name);
      const q = 3 + (i % 3); // variasi skor
      const p = 4 - (i % 2);
      const t = 3 + (i % 2);
      const init = 4;
      const d = 3 + (i % 3);
      const { totalScore, category } = calculateScore({
        quality: q, productivity: p, teamwork: t, initiative: init, discipline: d
      });
      samples.push({
        employeeId: emp._id,
        employeeName: emp.name,
        nik: emp.nik || `NIK${String(emp._id).slice(-6).toUpperCase()}`,
        dept: emp.dept || emp.department || 'Umum',
        position: emp.position || 'Staff',
        avatar: av.avatar, avatarBg: av.avatarBg,
        period: periods[i % 2],
        reviewer: 'Rizky Pratama',
        reviewDate: new Date(),
        quality: q, productivity: p, teamwork: t, initiative: init, discipline: d,
        totalScore, category,
        strengths: 'Bekerja dengan teliti dan konsisten',
        improvements: 'Perlu meningkatkan komunikasi tim',
        feedback: 'Kinerja keseluruhan baik, pertahankan.',
        status: ['Reviewed', 'Submitted', 'Draft'][i % 3],
      });
    });
    if (samples.length > 0) await Performance.insertMany(samples);
  }
}

// ==========================================
// ROUTE: KINERJA (REALTIME)
// ==========================================
app.get('/api/performance', async (req, res) => {
  try {
    await seedPerformance();
    const { search, period, status, dept } = req.query;
    const query = {};
    if (search) query.employeeName = { $regex: search, $options: 'i' };
    if (period && period !== 'Semua') query.period = period;
    if (status && status !== 'Semua') query.status = status;
    if (dept && dept !== 'Semua') query.dept = dept;
    const list = await Performance.find(query).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/performance/stats', async (req, res) => {
  try {
    const total = await Performance.countDocuments();
    const reviewed = await Performance.countDocuments({ status: 'Reviewed' });
    const pending = await Performance.countDocuments({ status: { $in: ['Draft', 'Submitted'] } });
    const excellent = await Performance.countDocuments({ category: 'Excellent' });
    
    const agg = await Performance.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalScore' } } }
    ]);
    const avgScore = agg[0]?.avg ? Math.round(agg[0].avg) : 0;

    res.json({ total, reviewed, pending, excellent, avgScore });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/performance', async (req, res) => {
  try {
    const data = { ...req.body };
    const { totalScore, category } = calculateScore(data);
    data.totalScore = totalScore;
    data.category = category;
    if (!data.reviewDate) data.reviewDate = new Date();
    res.status(201).json(await Performance.create(data));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/performance/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.quality !== undefined || data.productivity !== undefined) {
      const { totalScore, category } = calculateScore(data);
      data.totalScore = totalScore;
      data.category = category;
    }
    res.json(await Performance.findByIdAndUpdate(req.params.id, data, { new: true }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/performance/:id', async (req, res) => {
  try { await Performance.findByIdAndDelete(req.params.id); res.json({ message: 'deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});
// ==========================================
// ERROR HANDLER
// ==========================================
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}` });
});
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  await seedIfEmpty();
  await seedDepartments();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`🏢 Departments: http://localhost:${PORT}/api/departments`);
  });
});