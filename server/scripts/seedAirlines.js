/**
 * Seed Pakistani Airlines
 *
 * Run: node scripts/seedAirlines.js
 *
 * This script inserts all major Pakistani airlines into the database.
 * Airline logos should be placed in:
 *     server/public/uploads/airlines/
 *
 * Expected logo filenames (PNG, 300×200 or similar):
 *     pia.png
 *     airblue.png
 *     serene-air.png
 *     air-sial.png
 *     fly-jinnah.png
 *     k2-airways.png  (defunct but included for reference)
 *
 * You can replace these with your own images at any time via the
 * Admin → Add Airline page.
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../config/database');

const airlines = [
  {
    name: 'Pakistan International Airlines',
    code: 'PIA',
    logoFile: 'pia.png'
  },
  {
    name: 'AirBlue',
    code: 'PA',
    logoFile: 'airblue.png'
  },
  {
    name: 'Serene Air',
    code: 'ER',
    logoFile: 'serene-air.png'
  },
  {
    name: 'AirSial',
    code: 'PF',
    logoFile: 'air-sial.png'
  },
  {
    name: 'Fly Jinnah',
    code: 'FJ',  // marketing code 9P
    logoFile: 'fly-jinnah.png'
  }
];

const seed = async () => {
  try {
    // Sync DB
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('Database connected');

    const Airline = db.Airline;
    if (!Airline) {
      console.error('Airline model not found. Make sure server/models/Airline.js exists.');
      process.exit(1);
    }

    // Ensure uploads/airlines folder exists
    const logosDir = path.join(__dirname, '../public/uploads/airlines');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    let created = 0;
    let skipped = 0;

    for (const airline of airlines) {
      const existing = await Airline.findOne({ where: { name: airline.name } });
      if (existing) {
        console.log(`  ⏩ ${airline.name} already exists – skipped`);
        skipped++;
        continue;
      }

      // Check if logo file exists on disk
      const logoPath = path.join(logosDir, airline.logoFile);
      const logoUrl = fs.existsSync(logoPath)
        ? `/uploads/airlines/${airline.logoFile}`
        : null;

      await Airline.create({
        name: airline.name,
        code: airline.code,
        logoUrl,
        isActive: true,
        createdBy: null
      });

      const logoStatus = logoUrl ? '✅ logo found' : '⚠️  no logo yet';
      console.log(`  ✅ ${airline.name} (${airline.code}) created – ${logoStatus}`);
      created++;
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    console.log(`\n📁 Put airline logo images in:\n   ${logosDir}\n`);
    console.log('Expected filenames:');
    airlines.forEach(a => console.log(`   ${a.logoFile}  →  ${a.name}`));

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
