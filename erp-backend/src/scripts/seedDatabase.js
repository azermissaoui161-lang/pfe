// src/scripts/seedDatabase.js
// Seed script that populates the database with initial data
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Account = require('../models/Account');

/**
 * Run the seed - safe to call on every server start.
 * Only inserts data if collections are empty.
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Vérification et initialisation de la base de données...');

    // ─── USERS ─────────────────────────────────────────────────
    const userCount = await User.countDocuments();
    let adminUserId;

    if (userCount === 0) {
      console.log('   👤 Création des utilisateurs par défaut...');

      // Pre-hash passwords to guarantee correct hashing regardless of Mongoose hook timing
      const [pw1, pw2, pw3, pw4] = await Promise.all([
        bcrypt.hash('admin123', 10),
        bcrypt.hash('stock123', 10),
        bcrypt.hash('finance123', 10),
        bcrypt.hash('fact123', 10)
      ]);

      // Use insertMany to bypass pre-save hooks and insert directly with hashed passwords
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
      adminUserId = result[0]._id;
      console.log('   ✅ 4 utilisateurs créés (mots de passe hashés)');
    } else {
      console.log(`   ✅ Utilisateurs: ${userCount} existants (skip)`);
      const adminUser = await User.findOne({ role: 'admin_principal' }).select('_id');
      adminUserId = adminUser?._id;
    }

    // ─── CATEGORIES ────────────────────────────────────────────
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('   📂 Création des catégories...');
      await Category.create([
        { name: 'Électronique', description: 'Appareils électroniques et accessoires' },
        { name: 'Vêtements', description: 'Vêtements et accessoires de mode' },
        { name: 'Alimentation', description: 'Produits alimentaires et boissons' },
        { name: 'Mobilier', description: 'Meubles et décoration' },
        { name: 'Fournitures', description: 'Fournitures de bureau et matériel' },
        { name: 'Informatique', description: 'Matériel informatique et logiciels' }
      ]);
      console.log('   ✅ 6 catégories créées');
    } else {
      console.log(`   ✅ Catégories: ${categoryCount} existantes (skip)`);
    }

    // ─── SUPPLIERS ─────────────────────────────────────────────
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      console.log('   🏭 Création des fournisseurs...');
      const suppliers = await Supplier.create([
        {
          name: 'TechSupply SARL',
          contact: 'Ahmed Ben Salah',
          email: 'contact@techsupply.tn',
          phone: '+216 71 000 001',
          address: '15 Rue de l\'Industrie, Tunis',
          status: 'actif'
        },
        {
          name: 'Mode & Textile Co',
          contact: 'Sonia Trabelsi',
          email: 'info@modetextile.tn',
          phone: '+216 71 000 002',
          address: '8 Avenue Habib Bourguiba, Sfax',
          status: 'actif'
        },
        {
          name: 'Fournitures Pro',
          contact: 'Kamel Mansouri',
          email: 'ventes@fournitures-pro.tn',
          phone: '+216 71 000 003',
          address: '22 Zone Industrielle, Sousse',
          status: 'actif'
        }
      ]);
      console.log('   ✅ 3 fournisseurs créés');

      // ─── PRODUCTS ────────────────────────────────────────────
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('   📦 Création des produits...');
        await Product.create([
          {
            name: 'Laptop Dell Inspiron 15',
            category: 'Informatique',
            stock: 25,
            price: 1299.99,
            supplierId: suppliers[0]._id,
            minStock: 5,
            description: 'Ordinateur portable Dell Inspiron 15 pouces'
          },
          {
            name: 'Souris Logitech MX Master',
            category: 'Informatique',
            stock: 80,
            price: 89.99,
            supplierId: suppliers[0]._id,
            minStock: 15,
            description: 'Souris sans fil ergonomique'
          },
          {
            name: 'Clavier Mécanique RGB',
            category: 'Informatique',
            stock: 45,
            price: 129.99,
            supplierId: suppliers[0]._id,
            minStock: 10,
            description: 'Clavier mécanique avec rétroéclairage RGB'
          },
          {
            name: 'T-Shirt Coton Premium',
            category: 'Vêtements',
            stock: 200,
            price: 24.99,
            supplierId: suppliers[1]._id,
            minStock: 30,
            description: 'T-shirt en coton 100% premium'
          },
          {
            name: 'Ramette Papier A4',
            category: 'Fournitures',
            stock: 150,
            price: 8.50,
            supplierId: suppliers[2]._id,
            minStock: 20,
            description: 'Ramette de 500 feuilles A4 80g'
          },
          {
            name: 'Stylos Bille (boite 12)',
            category: 'Fournitures',
            stock: 8,
            price: 6.99,
            supplierId: suppliers[2]._id,
            minStock: 20,
            description: 'Boite de 12 stylos bille bleus'
          },
          {
            name: 'Écran 27" 4K',
            category: 'Électronique',
            stock: 0,
            price: 599.99,
            supplierId: suppliers[0]._id,
            minStock: 3,
            description: 'Moniteur 27 pouces résolution 4K'
          }
        ]);
        console.log('   ✅ 7 produits créés');
      }
    } else {
      console.log(`   ✅ Fournisseurs: ${supplierCount} existants (skip)`);
    }

    // ─── CUSTOMERS ─────────────────────────────────────────────
    if (adminUserId) {
      const customerCount = await Customer.countDocuments();
      if (customerCount === 0) {
        console.log('   👥 Création des clients...');
        await Customer.create([
          {
            customerNumber: 'CLI-2026-000001',
            type: 'professionnel',
            civility: 'M.',
            firstName: 'Mohamed',
            lastName: 'Ben Ali',
            email: 'mohamed.benali@email.tn',
            phone: '+216 22 000 001',
            address: {
              street: '12 Rue de la République',
              city: 'Tunis',
              postalCode: '1000',
              country: 'Tunisie'
            },
            company: 'Entreprise Ben Ali SARL',
            isActive: true,
            createdBy: adminUserId
          },
          {
            customerNumber: 'CLI-2026-000002',
            type: 'professionnel',
            civility: 'Mme',
            firstName: 'Fatma',
            lastName: 'Trabelsi',
            email: 'fatma.trabelsi@email.tn',
            phone: '+216 22 000 002',
            address: {
              street: '5 Avenue Farhat Hached',
              city: 'Sfax',
              postalCode: '3000',
              country: 'Tunisie'
            },
            company: 'Trabelsi & Associés',
            isActive: true,
            createdBy: adminUserId
          },
          {
            customerNumber: 'CLI-2026-000003',
            type: 'particulier',
            civility: 'M.',
            firstName: 'Karim',
            lastName: 'Mansouri',
            email: 'karim.mansouri@email.tn',
            phone: '+216 22 000 003',
            address: {
              street: '8 Rue Ibn Khaldoun',
              city: 'Sousse',
              postalCode: '4000',
              country: 'Tunisie'
            },
            isActive: true,
            createdBy: adminUserId
          }
        ]);
        console.log('   ✅ 3 clients créés');
      } else {
        console.log(`   ✅ Clients: ${customerCount} existants (skip)`);
      }
    }

    // ─── ACCOUNTS (PLAN COMPTABLE) ─────────────────────────────
    if (adminUserId) {
      const accountCount = await Account.countDocuments();
      if (accountCount === 0) {
        console.log('   📊 Création du plan comptable...');
        await Account.create([
          {
            code: '101',
            name: 'Capital social',
            type: 'passif',
            category: 'capital',
            balance: 100000,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '411',
            name: 'Clients',
            type: 'actif',
            category: 'client',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '401',
            name: 'Fournisseurs',
            type: 'passif',
            category: 'fournisseur',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '512',
            name: 'Banque',
            type: 'actif',
            category: 'banque',
            balance: 50000,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '530',
            name: 'Caisse',
            type: 'actif',
            category: 'caisse',
            balance: 5000,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '607',
            name: 'Achats de marchandises',
            type: 'charge',
            category: 'achat',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '707',
            name: 'Ventes de marchandises',
            type: 'produit',
            category: 'vente',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '445',
            name: 'TVA collectée',
            type: 'passif',
            category: 'taxe',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '641',
            name: 'Salaires du personnel',
            type: 'charge',
            category: 'salaire',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          },
          {
            code: '622',
            name: 'Loyers et charges locatives',
            type: 'charge',
            category: 'achat',
            balance: 0,
            isActive: true,
            createdBy: adminUserId
          }
        ]);
        console.log('   ✅ 10 comptes comptables créés');
      } else {
        console.log(`   ✅ Comptes: ${accountCount} existants (skip)`);
      }
    }

    console.log('✅ Initialisation terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    console.error('   Stack:', error.stack);
    // Don't throw - seed failure shouldn't crash the server
  }
};

module.exports = seedDatabase;
