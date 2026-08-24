import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import Leave from './models/Leave.js';
import Activity from './models/Activity.js';
import Announcement from './models/Announcement.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const employees = [
  { nik: 'EMP-001', name: 'Budi Santoso', role: 'Software Engineer', dept: 'IT', status: 'Aktif', email: 'budi@swabina.com', phone: '0812-3456-7890', joinDate: '2021-03-15', salary: 12000000 },
  { nik: 'EMP-002', name: 'Siti Rahma', role: 'HR Specialist', dept: 'Human Resource', status: 'Aktif', email: 'siti@swabina.com', phone: '0813-2222-1111', joinDate: '2020-07-01', salary: 9500000 },
  { nik: 'EMP-003', name: 'Andi Wijaya', role: 'Marketing Manager', dept: 'Marketing', status: 'Cuti', email: 'andi@swabina.com', phone: '0821-9999-8888', joinDate: '2019-01-10', salary: 15000000 },
  { nik: 'EMP-004', name: 'Dewi Lestari', role: 'Finance Staff', dept: 'Finance', status: 'Aktif', email: 'dewi@swabina.com', phone: '0857-1234-5678', joinDate: '2022-05-20', salary: 8000000 },
  { nik: 'EMP-005', name: 'Rizky Pratama', role: 'HR Administrator', dept: 'Human Resource', status: 'Aktif', email: 'rizky@swabina.com', phone: '0812-8888-7777', joinDate: '2023-02-01', salary: 7500000 },
  { nik: 'EMP-006', name: 'Joko Susilo', role: 'Operational Supervisor', dept: 'Operasional', status: 'Cuti', email: 'joko@swabina.com', phone: '0813-5555-4444', joinDate: '2018-09-12', salary: 11000000 },
  { nik: 'EMP-007', name: 'Maya Sari', role: 'Accountant', dept: 'Finance', status: 'Cuti', email: 'maya@swabina.com', phone: '0821-3333-2222', joinDate: '2021-11-05', salary: 9000000 },
  { nik: 'EMP-008', name: 'Rina Marlina', role: 'Marketing Staff', dept: 'Marketing', status: 'Aktif', email: 'rina@swabina.com', phone: '0857-6666-5555', joinDate: '2023-08-14', salary: 7000000 },
  { nik: 'EMP-009', name: 'Agus Setiawan', role: 'IT Support', dept: 'IT', status: 'Aktif', email: 'agus@swabina.com', phone: '0812-1111-2222', joinDate: '2022-01-30', salary: 8500000 },
  { nik: 'EMP-010', name: 'Fitri Handayani', role: 'Recruiter', dept: 'Human Resource', status: 'Aktif', email: 'fitri@swabina.com', phone: '0813-7777-8888', joinDate: '2024-03-18', salary: 7800000 },
];

const leaves = [
  { employeeName: 'Siti Rahma', nik: 'EMP-002', dept: 'Human Resource', type: 'Cuti Tahunan', startDate: '2026-07-22', endDate: '2026-07-24', duration: '3 hari', reason: 'Liburan keluarga', status: 'Pending', avatar: 'SR', avatarBg: 'bg-pink-100 text-pink-700' },
  { employeeName: 'Joko Susilo', nik: 'EMP-006', dept: 'Operasional', type: 'Cuti Sakit', startDate: '2026-07-20', endDate: '2026-07-21', duration: '2 hari', reason: 'Demam, surat dokter terlampir', status: 'Pending', avatar: 'JS', avatarBg: 'bg-indigo-100 text-indigo-700' },
  { employeeName: 'Maya Sari', nik: 'EMP-007', dept: 'Finance', type: 'Cuti Melahirkan', startDate: '2026-07-15', endDate: '2026-10-13', duration: '90 hari', reason: 'Persalinan anak pertama', status: 'Pending', avatar: 'MS', avatarBg: 'bg-rose-100 text-rose-700' },
  { employeeName: 'Budi Santoso', nik: 'EMP-001', dept: 'IT', type: 'Cuti Tahunan', startDate: '2026-07-10', endDate: '2026-07-12', duration: '3 hari', reason: 'Acara pernikahan adik', status: 'Disetujui', avatar: 'BS', avatarBg: 'bg-blue-100 text-blue-700' },
  { employeeName: 'Andi Wijaya', nik: 'EMP-003', dept: 'Marketing', type: 'Cuti Penting', startDate: '2026-07-18', endDate: '2026-07-18', duration: '1 hari', reason: 'Mengurus dokumen kependudukan', status: 'Disetujui', avatar: 'AW', avatarBg: 'bg-orange-100 text-orange-700' },
  { employeeName: 'Rina Marlina', nik: 'EMP-008', dept: 'Marketing', type: 'Cuti Tanpa Gaji', startDate: '2026-07-05', endDate: '2026-07-06', duration: '2 hari', reason: 'Keperluan pribadi', status: 'Ditolak', avatar: 'RM', avatarBg: 'bg-pink-100 text-pink-700' },
];

const activities = [
  { name: 'Siti Rahma', activity: 'Mengajukan cuti tahunan', module: 'Cuti', moduleColor: 'bg-amber-50 text-amber-700', time: '10 menit lalu', avatar: 'SR', avatarBg: 'bg-pink-100 text-pink-700' },
  { name: 'Budi Santoso', activity: 'Memperbarui profil karyawan', module: 'Karyawan', moduleColor: 'bg-blue-50 text-blue-700', time: '34 menit lalu', avatar: 'BS', avatarBg: 'bg-blue-100 text-blue-700' },
  { name: 'HR Operations', activity: 'Membuat penggajian Juli', module: 'Penggajian', moduleColor: 'bg-emerald-50 text-emerald-700', time: '1 jam lalu', avatar: 'HO', avatarBg: 'bg-emerald-100 text-emerald-700' },
  { name: 'Andi Wijaya', activity: 'Mengajukan reimbursement', module: 'Keuangan', moduleColor: 'bg-orange-50 text-orange-700', time: '2 jam lalu', avatar: 'AW', avatarBg: 'bg-orange-100 text-orange-700' },
  { name: 'Dewi Lestari', activity: 'Menyelesaikan evaluasi kinerja', module: 'Kinerja', moduleColor: 'bg-purple-50 text-purple-700', time: '3 jam lalu', avatar: 'DL', avatarBg: 'bg-purple-100 text-purple-700' },
];

const announcements = [
  { title: 'Rapat Umum Karyawan Q3', date: '25 Juli 2026', tag: 'Penting', tagColor: 'bg-red-100 text-red-700' },
  { title: 'Pelatihan Keselamatan Kerja', date: '28 Juli 2026', tag: 'Training', tagColor: 'bg-blue-100 text-blue-700' },
  { title: 'Libur Nasional Idul Adha', date: '17 Juni 2026', tag: 'Libur', tagColor: 'bg-emerald-100 text-emerald-700' },
];

const today = '2026-07-20';
const attendances = [
  { employeeName: 'Budi Santoso', nik: 'EMP-001', dept: 'IT', date: today, clockIn: '07:45', clockOut: '17:00', status: 'Hadir', avatar: 'BS', avatarBg: 'bg-blue-100 text-blue-700' },
  { employeeName: 'Siti Rahma', nik: 'EMP-002', dept: 'Human Resource', date: today, clockIn: '07:58', clockOut: '17:05', status: 'Hadir', avatar: 'SR', avatarBg: 'bg-pink-100 text-pink-700' },
  { employeeName: 'Andi Wijaya', nik: 'EMP-003', dept: 'Marketing', date: today, clockIn: '08:20', clockOut: '17:00', status: 'Terlambat', note: 'Macet di jalan', avatar: 'AW', avatarBg: 'bg-orange-100 text-orange-700' },
  { employeeName: 'Dewi Lestari', nik: 'EMP-004', dept: 'Finance', date: today, clockIn: '07:50', clockOut: '', status: 'Hadir', note: 'Belum absen pulang', avatar: 'DL', avatarBg: 'bg-sky-100 text-sky-700' },
  { employeeName: 'Rizky Pratama', nik: 'EMP-005', dept: 'Human Resource', date: today, clockIn: '', clockOut: '', status: 'Izin', note: 'Acara keluarga', avatar: 'RP', avatarBg: 'bg-emerald-100 text-emerald-700' },
  { employeeName: 'Joko Susilo', nik: 'EMP-006', dept: 'Operasional', date: today, clockIn: '', clockOut: '', status: 'Sakit', note: 'Surat dokter', avatar: 'JS', avatarBg: 'bg-indigo-100 text-indigo-700' },
  { employeeName: 'Maya Sari', nik: 'EMP-007', dept: 'Finance', date: today, clockIn: '', clockOut: '', status: 'Alpha', note: 'Tanpa keterangan', avatar: 'MS', avatarBg: 'bg-rose-100 text-rose-700' },
  { employeeName: 'Budi Santoso', nik: 'EMP-001', dept: 'IT', date: '2026-07-19', clockIn: '07:40', clockOut: '17:00', status: 'Hadir', avatar: 'BS', avatarBg: 'bg-blue-100 text-blue-700' },
  { employeeName: 'Rina Marlina', nik: 'EMP-008', dept: 'Marketing', date: '2026-07-19', clockIn: '08:15', clockOut: '17:00', status: 'Terlambat', avatar: 'RM', avatarBg: 'bg-pink-100 text-pink-700' },
  { employeeName: 'Agus Setiawan', nik: 'EMP-009', dept: 'IT', date: '2026-07-19', clockIn: '07:55', clockOut: '17:00', status: 'Hadir', avatar: 'AS', avatarBg: 'bg-slate-200 text-slate-700' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔄 Membersihkan database (data + index lama)...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database lama berhasil dihapus');

    console.log('🌱 Menanam data baru...');
    await Employee.insertMany(employees);
    await Leave.insertMany(leaves);
    await Activity.insertMany(activities);
    await Announcement.insertMany(announcements);
    await Attendance.insertMany(attendances);

    console.log('✅ Database berhasil di-seed!');
    console.log(`   - ${employees.length} karyawan`);
    console.log(`   - ${leaves.length} pengajuan cuti`);
    console.log(`   - ${activities.length} aktivitas`);
    console.log(`   - ${announcements.length} pengumuman`);
    console.log(`   - ${attendances.length} catatan absensi`);
    process.exit();
  } catch (err) {
    console.error('❌ Seed gagal:', err.message);
    process.exit(1);
  }
};

seed();