const express = require('express');
const router = express.Router();
const { getEmployees } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// Gunakan middleware 'protect' agar hanya user yang sudah login (punya token) yang bisa mengakses
router.get('/', protect, getEmployees);

module.exports = router;