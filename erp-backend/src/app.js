// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const financeRoutes = require('./routes/financeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardPrincipalRoutes = require('./routes/dashboardPrincipalRoutes');
const dashboardFactureRoutes = require('./routes/dashboardFactureRoutes');
const dashboardStockRoutes = require('./routes/dashboardStockRoutes');
const dashboardFinanceRoutes = require('./routes/dashboardFinanceRoutes');

// Créer l'application
const app = express();

// 1. Security
app.use(helmet());

// 2. CORS - Une seule fois !
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes
});
app.use('/api', limiter);

// 4. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Logging
app.use(morgan('dev'));

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockMovementRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard/principal', dashboardPrincipalRoutes);
app.use('/api/dashboard/facture', dashboardFactureRoutes);
app.use('/api/dashboard/stock', dashboardStockRoutes);
app.use('/api/dashboard/finance', dashboardFinanceRoutes);

// 7. Routes de test (UNE SEULE FOIS)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date(), 
    message: 'Serveur ERP opérationnel',
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  console.log('✅ Route /api/test appelée depuis:', req.headers.origin);
  res.json({ 
    success: true,
    message: 'Back-end ERP fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// 8. Error handler (UNE SEULE FOIS - doit être APRÈS les routes)
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 9. 404 (doit être À LA FIN)
app.use((req, res) => {
  console.log('❌ Route non trouvée:', req.method, req.url);
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée',
    path: req.url
  });
});

module.exports = app;