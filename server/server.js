const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database
const db = require('./config/database');
const { startBookingScheduler } = require('./services/bookingScheduler');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Initialize database
db.sequelize.authenticate()
  .then(() => console.log('MySQL connected successfully'))
  .catch(err => console.log('MySQL connection error:', err.message));

// Sync models with database
const isSqlite = (process.env.DB_TYPE || 'sqlite') === 'sqlite';
db.sequelize.sync(isSqlite ? undefined : undefined)
  .then(async () => {
    console.log('Database synced');
    try {
      if (db.Booking) {
        await db.Booking.update(
          { status: 'hold' },
          { where: { status: 'confirmed' } }
        );
        await db.Booking.update(
          { status: 'sold' },
          { where: { status: 'completed' } }
        );
      }
    } catch (err) {
      console.log('Booking status migration error:', err.message);
    }
    if (isSqlite) {
      try {
        const queryInterface = db.sequelize.getQueryInterface();
        const flightColumns = await queryInterface.describeTable('Flights');

        if (!flightColumns.group) {
          await queryInterface.addColumn('Flights', 'group', {
            type: db.Sequelize.STRING,
            defaultValue: 'ALL'
          });
          console.log('SQLite migration: added Flights.group');
        }

        if (!flightColumns.meal) {
          await queryInterface.addColumn('Flights', 'meal', {
            type: db.Sequelize.STRING,
            defaultValue: 'No Meal'
          });
          console.log('SQLite migration: added Flights.meal');
        }

        if (!flightColumns.baggage) {
          await queryInterface.addColumn('Flights', 'baggage', {
            type: db.Sequelize.STRING,
            defaultValue: '20kg'
          });
          console.log('SQLite migration: added Flights.baggage');
        }

        const agencyColumns = await queryInterface.describeTable('agencies');
        if (!agencyColumns.approvedAt) {
          await queryInterface.addColumn('agencies', 'approvedAt', {
            type: db.Sequelize.DATE,
            allowNull: true
          });
          console.log('SQLite migration: added agencies.approvedAt');
        }

        if (!agencyColumns.approvedBy) {
          await queryInterface.addColumn('agencies', 'approvedBy', {
            type: db.Sequelize.INTEGER,
            allowNull: true
          });
          console.log('SQLite migration: added agencies.approvedBy');
        }

        if (!agencyColumns.rejectionReason) {
          await queryInterface.addColumn('agencies', 'rejectionReason', {
            type: db.Sequelize.TEXT,
            allowNull: true
          });
          console.log('SQLite migration: added agencies.rejectionReason');
        }

        const bookingColumns = await queryInterface.describeTable('bookings');
        if (!bookingColumns.cancellationReason) {
          await queryInterface.addColumn('bookings', 'cancellationReason', {
            type: db.Sequelize.TEXT,
            allowNull: true
          });
          console.log('SQLite migration: added bookings.cancellationReason');
        }

        if (!bookingColumns.cancelledBy) {
          await queryInterface.addColumn('bookings', 'cancelledBy', {
            type: db.Sequelize.STRING,
            allowNull: true
          });
          console.log('SQLite migration: added bookings.cancelledBy');
        }

        if (!bookingColumns.cancelledAt) {
          await queryInterface.addColumn('bookings', 'cancelledAt', {
            type: db.Sequelize.DATE,
            allowNull: true
          });
          console.log('SQLite migration: added bookings.cancelledAt');
        }
      } catch (err) {
        console.log('SQLite migration error:', err.message);
      }
    }
    
    // Start booking scheduler to auto-convert 'hold' to 'sold' when flight departs
    // Temporarily disabled for debugging - uncomment when stable
    // startBookingScheduler();
  })
  .catch(err => console.log('Database sync error:', err.message));

// Make db available globally
global.db = db;

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin/flights', require('./routes/flightRoutes'));
app.use('/api/admin/agencies', require('./routes/agencyRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/banks', require('./routes/bankRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
