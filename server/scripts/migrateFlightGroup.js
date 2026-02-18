const { sequelize } = require('../config/database');

/**
 * Migration script to change 'group' column from ENUM to STRING
 * This fixes the "Data truncated for column 'group'" error
 */

// Deprecated: This migration script used Sequelize/MySQL. Use Supabase for migrations now.
// async function migrateFlightGroupColumn() {
  try {
    console.log('Starting migration: Converting flight.group from ENUM to VARCHAR...');
    
    // Using raw SQL to alter the column type
    await sequelize.query(`
      ALTER TABLE flights 
      MODIFY COLUMN \`group\` VARCHAR(255) NOT NULL DEFAULT 'ALL'
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('The "group" column can now accept any group name from the Groups table.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }


// Run migration
// migrateFlightGroupColumn();
