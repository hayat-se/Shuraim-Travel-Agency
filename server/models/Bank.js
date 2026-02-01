const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bank = sequelize.define('Bank', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branchName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branchCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branchAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'banks'
  });

  return Bank;
};
