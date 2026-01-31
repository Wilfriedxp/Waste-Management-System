const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Job = sequelize.define('Job', {
  // Unique ID is created automatically by Sequelize
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true // Optional: good for the Geo-Service integration
  },
  salaryRange: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = Job;