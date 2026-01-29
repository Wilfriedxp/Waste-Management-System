const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CollectionRequest = sequelize.define('CollectionRequest', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pickup_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    waste_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    estimated_volume: {
      type: DataTypes.FLOAT,
      defaultValue: 1
    },
    preferred_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preferred_time_slot: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
        isIn: [['pending', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled']]
      }
    },
    assigned_collector_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scheduled_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    completed_at: {
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
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'collection_requests',
    timestamps: true,
    createdAt: 'requested_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return CollectionRequest;
};
