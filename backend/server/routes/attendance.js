import express from 'express';
import Attendance from '../models/Attendance.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, status, date } = req.query;
    const filter = {};
    if (search) filter.employeeName = { $regex: search, $options: 'i' };
    if (status && status !== 'Semua') filter.status = status;
    if (date) filter.date = date;
    res.json(await Attendance.find(filter).sort({ date: -1, createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const base = req.query.date ? { date: req.query.date } : {};
    const hadir = await Attendance.countDocuments({ ...base, status: 'Hadir' });
    const terlambat = await Attendance.countDocuments({ ...base, status: 'Terlambat' });
    const izin = await Attendance.countDocuments({ ...base, status: { $in: ['Izin', 'Sakit'] } });
    const alpha = await Attendance.countDocuments({ ...base, status: 'Alpha' });
    res.json({ hadir, terlambat, izin, alpha, total: hadir + terlambat + izin + alpha });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await Attendance.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try { res.json(await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try { await Attendance.findByIdAndDelete(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;