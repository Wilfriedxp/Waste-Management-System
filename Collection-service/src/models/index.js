// models/index.js
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import model definitions
const WasteNotification = require('./notification.model')(sequelize);
const CollectionRequest = require('./request.model')(sequelize);

// Define associations if needed
// WasteNotification.belongsTo(User, { foreignKey: 'user_id' });
// CollectionRequest.belongsTo(User, { foreignKey: 'user_id' });

// Sync models with database
const syncDatabase = async () => {
  try {
    // First, try to connect to the default postgres database to create our database
    const { Sequelize } = require('sequelize');
    const tempSequelize = new Sequelize(
      'postgres', // default postgres database
      process.env.DATABASE_USER || 'postgres',
      process.env.DATABASE_PASSWORD || 'christabel',
      {
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    // Create database if it doesn't exist
    const dbName = process.env.DATABASE_NAME || 'collection_service_db';
    try {
      await tempSequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } catch (createError) {
      if (createError.original && createError.original.code === '42P04') {
        console.log(`Database "${dbName}" already exists.`);
      } else {
        throw createError;
      }
    }

    await tempSequelize.close();

    // Now connect to our specific database
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models (use { force: true } only in development to drop and recreate tables)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  WasteNotification,
  CollectionRequest,
  syncDatabase
};
