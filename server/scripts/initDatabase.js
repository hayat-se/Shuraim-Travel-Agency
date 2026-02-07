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

    // Sync models – alter:true ensures any new/changed columns are applied
    await db.sequelize.sync({ alter: true });
    console.log('Database tables synced (alter mode)');

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
