import express from 'express';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Activity from '../models/Activity.js';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// Stats untuk dashboard
router.get('/stats', async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: 'Aktif' });
    const onLeave = await Employee.countDocuments({ status: 'Cuti' });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const totalSalary = await Employee.aggregate([
      { $match: { status: 'Aktif' } },
      { $group: { _id: null, total: { $sum: '$salary' } } },
    ]);

    res.json({
      totalEmployees: total,
      activeEmployees: active,
      onLeave,
      pendingLeaves,
      totalSalary: totalSalary[0]?.total || 0,
      attendanceRate: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/activities', async (req, res) => {
  const data = await Activity.find().sort({ createdAt: -1 }).limit(5);
  res.json(data);
});

router.get('/announcements', async (req, res) => {
  const data = await Announcement.find().sort({ createdAt: -1 });
  res.json(data);
});

router.get('/leaves', async (req, res) => {
  const data = await Leave.find({ status: 'Pending' });
  res.json(data);
});

// Approve leave
router.put('/leaves/:id/approve', async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Disetujui' },
      { new: true }
    );
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;