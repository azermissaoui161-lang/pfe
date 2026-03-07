// src/pages/finance/DashboardFinancier.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import './DashboardFinancier.css';

const DashboardFinancier = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [transactions] = useState([
    { id: 1, description: 'Vente produit A', montant: 1500, type: 'revenu', date: '2024-01-15' },
    { id: 2, description: 'Achat fournitures', montant: 800, type: 'depense', date: '2024-01-16' },
    { id: 3, description: 'Facture client B', montant: 2300, type: 'revenu', date: '2024-01-17' },
  ]);

  // Récupérer le rôle de l'utilisateur au chargement
  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    console.log("💰 DashboardFinance - Rôle utilisateur:", role);
  }, []);

  // Fonction de retour intelligente
  const handleRetour = () => {
    console.log("💰 Redirection depuis DashboardFinance - Rôle:", userRole);
    
    // Si admin_principal → retour vers /admin
    if (userRole === 'admin_principal') {
      navigate('/admin');
    } 
    // Si admin_finance → retour vers /finance
    else if (userRole === 'admin_finance') {
      navigate('/finance');
    }
    // Fallback (au cas où)
    else {
      navigate('/');
    }
  };

  const totalRevenus = transactions
    .filter(t => t.type === 'revenu')
    .reduce((acc, t) => acc + t.montant, 0);

  const totalDepenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((acc, t) => acc + t.montant, 0);

  return (
    <div className="dashboard-financier">
      {/* Bouton de retour intelligent */}
      <button 
        className="back-button"
        onClick={handleRetour}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          background: userRole === 'admin_principal' ? '#667eea' : '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1rem'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = userRole === 'admin_principal' ? '#5a67d8' : '#3182ce';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = userRole === 'admin_principal' ? '#667eea' : '#4299e1';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {userRole === 'admin_principal' ? 'Retour à l\'administration' : 'Retour à la gestion financière'}
      </button>

      <h1>Dashboard Financier</h1>
      
      <div className="stats">
        <div className="stat-card revenu">
          <h3>Revenus</h3>
          <p>{totalRevenus} €</p>
        </div>
        <div className="stat-card depense">
          <h3>Dépenses</h3>
          <p>{totalDepenses} €</p>
        </div>
        <div className="stat-card benefice">
          <h3>Bénéfice</h3>
          <p>{totalRevenus - totalDepenses} €</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Montant</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td>{t.montant} €</td>
              <td>{t.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardFinancier;