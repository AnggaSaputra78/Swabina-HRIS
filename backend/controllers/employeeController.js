const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  try {
    // Populate digunakan untuk mengambil detail Departemen dan Posisi, bukan hanya ID-nya saja
    const employees = await Employee.find({})
      .populate('department', 'name code')
      .populate('position', 'title level')
      .sort({ createdAt: -1 });
      
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees };