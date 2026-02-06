// Database initialization script
// Run this once to setup initial admin user

const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('../config/database');

const initializeDatabase = async () => {
  try {
    const dbType = process.env.DB_TYPE || 'sqlite';

    // Authenticate with database
    await db.sequelize.authenticate();
    console.log(`${dbType.toUpperCase()} connected successfully`);

    // Sync models (no alter for SQLite)
    await db.sequelize.sync();
    console.log('Database models synced');

    if (dbType === 'sqlite') {
      const queryInterface = db.sequelize.getQueryInterface();
      const columns = await queryInterface.describeTable('Flights');

      if (!columns.group) {
        await queryInterface.addColumn('Flights', 'group', {
          type: db.Sequelize.STRING,
          defaultValue: 'ALL'
        });
        console.log('SQLite migration: added Flights.group');
      }

      if (!columns.meal) {
        await queryInterface.addColumn('Flights', 'meal', {
          type: db.Sequelize.STRING,
          defaultValue: 'No Meal'
        });
        console.log('SQLite migration: added Flights.meal');
      }

      if (!columns.baggage) {
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

      if (!agencyColumns.resetOtpHash) {
        await queryInterface.addColumn('agencies', 'resetOtpHash', {
          type: db.Sequelize.STRING,
          allowNull: true
        });
        console.log('SQLite migration: added agencies.resetOtpHash');
      }

      if (!agencyColumns.resetOtpExpiresAt) {
        await queryInterface.addColumn('agencies', 'resetOtpExpiresAt', {
          type: db.Sequelize.DATE,
          allowNull: true
        });
        console.log('SQLite migration: added agencies.resetOtpExpiresAt');
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
    }

    // Create super admin user
    const adminEmail = 'admin@airline.com';
    const existingAdmin = await db.Admin.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await db.Admin.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        companyName: 'Pakistan Airlines Agency',
        phone: '+92-300-1234567',
        address: 'Karachi, Pakistan',
        city: 'Karachi',
        country: 'Pakistan'
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password: admin123');
      console.log('⚠️ Change password after first login!');
    }

    await db.sequelize.close();
    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
};

initializeDatabase();
