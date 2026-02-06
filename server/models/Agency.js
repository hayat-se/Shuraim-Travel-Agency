const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agency = sequelize.define('Agency', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    agencyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone2: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    country: {
      type: DataTypes.STRING,
      defaultValue: 'Pakistan'
    },
    registrationNumber: DataTypes.STRING,
    taxId: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'blocked'),
      defaultValue: 'pending'
    },
    approvedAt: DataTypes.DATE,
    approvedBy: DataTypes.INTEGER,
    rejectionReason: DataTypes.TEXT,
    role: {
      type: DataTypes.ENUM('agency'),
      defaultValue: 'agency'
    },
    totalBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    resetOtpHash: DataTypes.STRING,
    resetOtpExpiresAt: DataTypes.DATE
  }, {
    timestamps: true,
    tableName: 'agencies'
  });

  return Agency;
};
