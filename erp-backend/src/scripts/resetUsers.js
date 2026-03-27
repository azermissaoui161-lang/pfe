// src/scripts/resetUsers.js
// Drops the users collection and re-seeds with correctly hashed passwords
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop all users
    await User.deleteMany({});
    console.log('All users deleted');

    // Pre-hash passwords
    const [pw1, pw2, pw3, pw4] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('stock123', 10),
      bcrypt.hash('finance123', 10),
      bcrypt.hash('fact123', 10)
    ]);

    console.log('Hashed passwords:');
    console.log('  admin123 ->', pw1);
    console.log('  stock123 ->', pw2);

    // Verify hashes work
    const testMatch = await bcrypt.compare('admin123', pw1);
    console.log('  Verify admin123 matches hash:', testMatch);

    const now = new Date();
    const result = await User.insertMany([
      {
        firstName: 'Admin',
        lastName: 'Principal',
        email: 'admin@erp.com',
        password: pw1,
        role: 'admin_principal',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        firstName: 'Admin',
        lastName: 'Stock',
        email: 'stock@erp.com',
        password: pw2,
        role: 'admin_stock',
        department: 'stock',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        firstName: 'Admin',
        lastName: 'Finance',
        email: 'finance@erp.com',
        password: pw3,
        role: 'admin_finance',
        department: 'finance',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        firstName: 'Admin',
        lastName: 'Facturation',
        email: 'facturation@erp.com',
        password: pw4,
        role: 'admin_facture',
        department: 'facturation',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]);

    console.log(`\n${result.length} users created`);

    // Final verification: read back and compare
    const admin = await User.findOne({ email: 'admin@erp.com' }).select('+password');
    console.log('\nVerification:');
    console.log('  Stored hash starts with $2:', admin.password.startsWith('$2'));
    console.log('  bcrypt.compare("admin123", storedHash):', await bcrypt.compare('admin123', admin.password));
    console.log('  user.comparePassword("admin123"):', await admin.comparePassword('admin123'));

    console.log('\nDone! You can now login with admin@erp.com / admin123');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
