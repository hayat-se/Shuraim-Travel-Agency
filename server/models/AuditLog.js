const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    action: {
      type: DataTypes.ENUM('booking_created', 'booking_cancelled', 'flight_created', 'flight_updated', 'agency_approved', 'agency_rejected'),
      allowNull: false
    },
    userId: DataTypes.INTEGER,
    userRole: DataTypes.STRING,
    userEmail: DataTypes.STRING,
    bookingId: DataTypes.INTEGER,
    flightId: DataTypes.INTEGER,
    agencyId: DataTypes.INTEGER,
    details: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    timestamps: false,
    createdAt: 'timestamp',
    updatedAt: false,
    tableName: 'audit_logs'
  });

  return AuditLog;
};
