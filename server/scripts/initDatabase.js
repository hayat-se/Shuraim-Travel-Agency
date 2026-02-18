// Database initialization script
// Run this once to setup initial admin user

const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = require('../api/index');

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
    const { data: existingAdminArr, error: existingAdminErr } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .limit(1);
    const existingAdmin = existingAdminArr && existingAdminArr[0];

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const { data: admin, error: createError } = await supabase
        .from('admins')
        .insert([
          {
            name: 'System Administrator',
            email: adminEmail,
            password: hashedPassword,
            role: 'super_admin',
            companyName: 'Pakistan Airlines Agency',
            phone: '+92-300-1234567',
            address: 'Karachi, Pakistan',
            city: 'Karachi',
            country: 'Pakistan'
          }
        ]);
      if (createError) throw createError;
      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password: admin123');
      console.log('⚠️ Change password after first login!');
    }

    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
};

initializeDatabase();
