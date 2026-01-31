const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Application = sequelize.define('Application', {
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    jobId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    resumeUrl: { 
        type: DataTypes.STRING 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'pending' 
    }
});

module.exports = Application;