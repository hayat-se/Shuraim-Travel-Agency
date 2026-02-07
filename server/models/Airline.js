const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Airline = sequelize.define('Airline', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logoUrl: {
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
    tableName: 'airlines'
  });

  return Airline;
};
