const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// ===== JOBS =====
exports.getJobs = async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
};

exports.createJob = async (req, res) => {
  const job = await Job.create(req.body);
  res.status(201).json(job);
};

exports.deleteJob = async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Lowongan dihapus' });
};

// ===== CANDIDATES =====
exports.getCandidates = async (req, res) => {
  const candidates = await Candidate.find().sort({ createdAt: -1 });
  res.json(candidates);
};

exports.createCandidate = async (req, res) => {
  const candidate = await Candidate.create(req.body);
  res.status(201).json(candidate);
};

exports.updateCandidate = async (req, res) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(candidate);
};

exports.deleteCandidate = async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ message: 'Kandidat dihapus' });
};