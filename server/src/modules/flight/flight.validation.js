const { body } = require('express-validator');

const createRules = [
  body('airlineName').trim().notEmpty().withMessage('Airline name is required'),
  body('flightNumber').trim().notEmpty().withMessage('Flight number is required'),
  body('departureCity').trim().notEmpty().withMessage('Departure city is required'),
  body('destinationCity').trim().notEmpty().withMessage('Destination city is required'),
  body('departureDate').notEmpty().withMessage('Departure date is required'),
  body('arrivalDate').notEmpty().withMessage('Arrival date is required'),
  body('flightClass').isIn(['economy', 'business']).withMessage('Flight class must be economy or business'),
  body('totalSeatsAvailable').isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  body('pricePerSeat').isFloat({ min: 0 }).withMessage('Price per seat must be a positive number'),
];

module.exports = { createRules };
