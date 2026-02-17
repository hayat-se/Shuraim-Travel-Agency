const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');

// adding this for long name and sync
const db = require('./config/database');
db.sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
  // You can start your server here if needed
});
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

// Add Vercel-provided URL if present (VERCEL_URL is without protocol)
if (process.env.VERCEL_URL) {
  const vercelOrigin = `https://${process.env.VERCEL_URL}`;
  if (!allowedOrigins.includes(vercelOrigin)) {
    allowedOrigins.push(vercelOrigin);
  }
}

// Allow localhost in development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

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
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Image serving from DB (before rate limiter - images should load freely)
app.use('/api/images', require('./routes/imageRoutes'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Initialize database and start server
const bcrypt = require('bcryptjs');

const initializeApp = async () => {
  try {
    // Connect to MySQL
    await db.sequelize.authenticate();
    console.log('MySQL connected successfully');

    // Sync all tables (alter: true adds missing columns automatically)
    await db.sequelize.sync({ alter: true });
    console.log('Database tables synced');

    // Auto-create admin user if not exists
    const adminEmail = 'admin@airline.com';
    const existingAdmin = await db.Admin.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.Admin.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        companyName: 'Shuraim Air Travel & Tours',
        phone: '+92-300-1234567',
        address: 'Karachi, Pakistan',
        city: 'Karachi',
        country: 'Pakistan'
      });
      console.log('Admin user created (admin@airline.com / admin123)');
    }

    // Start booking scheduler
    const schedulerEnabled = (process.env.BOOKING_SCHEDULER_ENABLED || 'true')
      .toLowerCase() === 'true';
    if (schedulerEnabled) {
      startBookingScheduler();
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

initializeApp();

// --- AUTO DB INDEX CLEANUP FOR ADMINS TABLE ---
const cleanupAdminIndexes = async () => {
  try {
    const [indexes] = await db.sequelize.query('SHOW INDEX FROM admins;');
    const emailIndexes = indexes.filter(idx => idx.Column_name === 'email' && idx.Key_name !== 'PRIMARY');
    let kept = false;
    for (const idx of emailIndexes) {
      if (idx.Non_unique === 0 && !kept) {
        kept = true;
        continue;
      }
      await db.sequelize.query(`DROP INDEX \`${idx.Key_name}\` ON admins;`);
    }
    console.log('Duplicate indexes on admins.email cleaned up.');
  } catch (err) {
    console.error('Index cleanup failed:', err.message);
  }
};

// Call cleanup on server start
cleanupAdminIndexes();

// --- AUTO DB ADMIN USER CREATION ---
const ensureAdminUser = async () => {
  try {
    const adminEmail = 'admin@airline.com';
    const existingAdmin = await db.Admin.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.Admin.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        companyName: 'Shuraim Air Travel & Tours',
        phone: '+92-300-1234567',
        address: 'Karachi, Pakistan',
        city: 'Karachi',
        country: 'Pakistan'
      });
      console.log('Admin user created (admin@airline.com / admin123)');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Admin user creation failed:', err.message);
  }
};

// Call admin user creation on server start
ensureAdminUser();

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
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/airlines', require('./routes/airlineRoutes'));

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
