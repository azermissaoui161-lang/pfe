const mongoose = require('mongoose');
const Category = require('../src/models/Category');
require('dotenv').config({ path: '../.env' });

const categories = [
  { 
    name: 'Électronique', 
    description: 'Produits électroniques et gadgets technologiques',
    status: 'active'
  },
  { 
    name: 'Informatique', 
    description: 'Ordinateurs, serveurs et accessoires informatiques',
    status: 'active'
  },
  { 
    name: 'Téléphonie', 
    description: 'Téléphones mobiles et accessoires',
    status: 'active'
  },
  { 
    name: 'Audio', 
    description: 'Casques, écouteurs, enceintes et équipements audio',
    status: 'active'
  },
  { 
    name: 'Accessoires', 
    description: 'Accessoires divers pour appareils électroniques',
    status: 'active'
  },
  { 
    name: 'Réseau', 
    description: 'Équipements réseau et connectivité',
    status: 'inactive'
  }
];

const seedCategories = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db');
    console.log('✅ Connecté à MongoDB');

    // Supprimer les anciennes catégories
    await Category.deleteMany();
    console.log('📝 Anciennes catégories supprimées');

    // Insérer les nouvelles catégories
    const result = await Category.insertMany(categories);
    console.log(`✅ ${result.length} catégories ajoutées avec succès:`);
    result.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

seedCategories();