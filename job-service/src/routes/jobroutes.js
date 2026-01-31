const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobcontroller');

// JM01: Get all jobs (For Worker and Citizen dashboards)
router.get('/jobs', jobController.getAllJobs);

// JM02: Create a new job posting (Citizen)
router.post('/jobs', jobController.createJob);

// JM03: Claim/Apply for a job (Worker)
router.post('/jobs/:jobId/apply', jobController.applyToJob);

// JM04: View all applications (Admin)
router.get('/applications', jobController.getApplications);

// JM05: Update application & job status (Admin Accept/Decline/Complete)
router.patch('/applications/:id', jobController.updateApplicationStatus);
//JM06: delete application
router.delete('/jobs/:id', jobController.deleteJob);

module.exports = router;