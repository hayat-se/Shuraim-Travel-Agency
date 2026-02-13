const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    flightId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'flights',
        key: 'id'
      }
    },
    agencyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'agencies',
        key: 'id'
      }
    },
    seatsBooked: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'PKR'
    },
    passengers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('pending', 'hold', 'cancel_requested', 'cancelled', 'sold'),
      defaultValue: 'pending'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed'),
      defaultValue: 'pending'
    },
    ticketGenerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ticketUrl: DataTypes.STRING,
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelledBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'bookings'
  });

  return Booking;
};
