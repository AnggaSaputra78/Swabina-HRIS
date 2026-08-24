import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// GET all (dengan filter search, dept, status)
router.get('/', async (req, res) => {
  try {
    const { search, dept, status } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { nik:   { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role:  { $regex: search, $options: 'i' } },
      ];
    }
    if (dept && dept !== 'Semua') filter.dept = dept;
    if (status && status !== 'Semua') filter.status = status;

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create (NIK auto-generate)
router.post('/', async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    const nik = `EMP-${String(count + 1).padStart(3, '0')}`;
    const emp = await Employee.create({ ...req.body, nik });
    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(emp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Karyawan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;