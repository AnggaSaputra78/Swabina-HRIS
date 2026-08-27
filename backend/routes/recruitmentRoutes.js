const express = require('express');
const router = express.Router();
const {
  getJobs, createJob, deleteJob,
  getCandidates, createCandidate, updateCandidate, deleteCandidate,
} = require('../controllers/recruitmentController');

router.route('/jobs').get(getJobs).post(createJob);
router.route('/jobs/:id').delete(deleteJob);

router.route('/candidates').get(getCandidates).post(createCandidate);
router.route('/candidates/:id').put(updateCandidate).delete(deleteCandidate);

module.exports = router;