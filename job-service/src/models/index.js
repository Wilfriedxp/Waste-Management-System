const sequelize = require('../../config/database');
const { DataTypes } = require('sequelize');

// Import the blueprints from your other files
const Job = require('./Job');
const Application = require('./Application');

// Define Relationships (Requirement JM02/JM03)
// This links an Application to a specific Job in the database
Job.hasMany(Application, { 
    foreignKey: 'jobId', 
    onDelete: 'CASCADE' // If a job is deleted, delete its applications too
});
Application.belongsTo(Job, { 
    foreignKey: 'jobId' 
});

// Export the connection and the models so the Controller can use them
module.exports = { 
    sequelize, 
    Application, 
    Job 
};