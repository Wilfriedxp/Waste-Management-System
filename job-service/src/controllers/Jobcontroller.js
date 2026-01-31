const { Job, Application } = require('../models/index');

// Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll(); 
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Job (Citizen)
exports.createJob = async (req, res) => {
    try {
        const job = await Job.create({
            title: req.body.title,
            location: req.body.location,
            contactPhone: req.body.contactPhone, // Ensure this matches frontend
            description: req.body.description || "No description provided",
            status: 'open'
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete/Decline Job (Citizen) - NEW FUNCTION
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        if (!job) return res.status(404).json({ message: "Job not found" });
        
        await job.destroy();
        res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Claim Job (Worker)
exports.applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findByPk(jobId);

        if (!job || job.status !== 'open') {
            return res.status(400).json({ message: "Task already claimed or unavailable!" });
        }

        const application = await Application.create({
            jobId,
            userId: req.body.userId || 1,
            status: 'pending' // Stays pending until Admin approves
        });

        await job.update({ status: 'pending' });
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// View Apps (Admin)
exports.getApplications = async (req, res) => {
    try {
        const apps = await Application.findAll({ include: [{ model: Job }] });
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Status Update (Admin Approval or Completion)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const app = await Application.findByPk(id);
        if (!app) return res.status(404).json({ message: "Application not found" });

        await app.update({ status });

        if (status === 'accepted') {
            await Job.update({ status: 'assigned' }, { where: { id: app.jobId } });
        } else if (status === 'declined') {
            await Job.update({ status: 'open' }, { where: { id: app.jobId } });
        } else if (status === 'completed') {
            await Job.update({ status: 'closed' }, { where: { id: app.jobId } });
        }

        res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};