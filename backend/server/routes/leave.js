import express from 'express';
import Leave from '../models/Leave.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status && status !== 'Semua') filter.status = status;
    if (type && type !== 'Semua') filter.type = type;
    res.json(await Leave.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const pending = await Leave.countDocuments({ status: 'Pending' });
    const approved = await Leave.countDocuments({ status: 'Disetujui' });
    const rejected = await Leave.countDocuments({ status: 'Ditolak' });
    res.json({ pending, approved, rejected, total: pending + approved + rejected });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await Leave.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try { res.json(await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/approve', async (req, res) => {
  try { res.json(await Leave.findByIdAndUpdate(req.params.id, { status: 'Disetujui' }, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/reject', async (req, res) => {
  try { res.json(await Leave.findByIdAndUpdate(req.params.id, { status: 'Ditolak' }, { new: true })); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try { await Leave.findByIdAndDelete(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;