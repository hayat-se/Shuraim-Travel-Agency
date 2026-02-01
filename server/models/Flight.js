const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Flight = sequelize.define('Flight', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    airlineName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    flightNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    departureCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destinationCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departureDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    departureTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    arrivalDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    arrivalTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    flightClass: {
      type: DataTypes.ENUM('economy', 'business'),
      allowNull: false
    },
    totalSeatsAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seatsBooked: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    seatsRemaining: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pricePerSeat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'PKR'
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'completed'),
      defaultValue: 'active'
    },
    group: {
      type: DataTypes.ENUM('ALL', 'KSA', 'UAE', 'QATAR', 'BAHRAIN', 'OMAN', 'KUWAIT'),
      defaultValue: 'ALL'
    },
    meal: {
      type: DataTypes.STRING,
      defaultValue: 'No Meal'
    },
    baggage: {
      type: DataTypes.STRING,
      defaultValue: '20kg'
    },
    createdBy: DataTypes.INTEGER
  }, {
    timestamps: true,
    tableName: 'flights'
  });

  return Flight;
};
