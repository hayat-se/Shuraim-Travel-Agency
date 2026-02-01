const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Use SQLite for development if MySQL is not available
const dbType = process.env.DB_TYPE || 'sqlite';

let sequelize;

if (dbType === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'airline_agency',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // SQLite for development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../airline_agency.db'),
    logging: false
  });
}

const db = {};

// Load all models
const modelsPath = path.join(__dirname, '../models');
fs.readdirSync(modelsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(modelsPath, file))(sequelize);
    db[model.name] = model;
  });

// Set up associations
if (db.Booking && db.Flight) {
  db.Booking.belongsTo(db.Flight, { foreignKey: 'flightId', as: 'flight' });
  db.Flight.hasMany(db.Booking, { foreignKey: 'flightId' });
}

if (db.Booking && db.Agency) {
  db.Booking.belongsTo(db.Agency, { foreignKey: 'agencyId', as: 'agency' });
  db.Agency.hasMany(db.Booking, { foreignKey: 'agencyId' });
}

if (db.Flight && db.Admin) {
  db.Flight.belongsTo(db.Admin, { foreignKey: 'createdBy', as: 'creator' });
  db.Admin.hasMany(db.Flight, { foreignKey: 'createdBy' });
}

if (db.Bank && db.Admin) {
  db.Bank.belongsTo(db.Admin, { foreignKey: 'createdBy', as: 'creator' });
  db.Admin.hasMany(db.Bank, { foreignKey: 'createdBy' });
}

if (db.Payment && db.Agency) {
  db.Payment.belongsTo(db.Agency, { foreignKey: 'agencyId', as: 'agency' });
  db.Agency.hasMany(db.Payment, { foreignKey: 'agencyId' });
}

if (db.Payment && db.Bank) {
  db.Payment.belongsTo(db.Bank, { foreignKey: 'bankId', as: 'bank' });
  db.Bank.hasMany(db.Payment, { foreignKey: 'bankId' });
}

if (db.Feedback && db.Agency) {
  db.Feedback.belongsTo(db.Agency, { foreignKey: 'agencyId', as: 'agency' });
  db.Agency.hasMany(db.Feedback, { foreignKey: 'agencyId' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
