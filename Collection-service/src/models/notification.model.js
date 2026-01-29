const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WasteNotification = sequelize.define('WasteNotification', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    waste_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estimated_volume: {
      type: DataTypes.FLOAT,
      defaultValue: 1
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of photo URLs
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    urgency: {
      type: DataTypes.STRING,
      defaultValue: 'normal'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'verified', 'scheduled_for_cleanup', 'cleaned', 'rejected']]
      }
    },
    verified_by: {
      type: DataTypes.INTEGER, // Admin/staff ID who verified
      allowNull: true
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cleanup_scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cleaned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    public_visibility: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'waste_notifications',
    timestamps: true,
    createdAt: 'reported_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return WasteNotification;
};