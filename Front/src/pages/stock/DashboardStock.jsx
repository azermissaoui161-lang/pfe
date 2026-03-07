// DashboardStock.jsx 
// src/pages/stock/DashboardStock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import './DashboardStock.css';

const DashboardStock = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [produits] = useState([
    { id: 1, nom: 'Produit A', quantite: 45, prix: 299 },
    { id: 2, nom: 'Produit B', quantite: 12, prix: 49 },
    { id: 3, nom: 'Produit C', quantite: 8, prix: 89 },
  ]);

  // Récupérer le rôle de l'utilisateur au chargement
  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    console.log("📦 DashboardStock - Rôle utilisateur:", role);
  }, []);

  // Fonction de retour intelligente
  const handleRetour = () => {
    console.log("📦 Redirection depuis DashboardStock - Rôle:", userRole);
    
    // Si admin_principal → retour vers /admin
    if (userRole === 'admin_principal') {
      navigate('/admin');
    } 
    // Si admin_stock → retour vers /stock
    else if (userRole === 'admin_stock') {
      navigate('/stock');
    }
    // Fallback (au cas où)
    else {
      navigate('/');
    }
  };

  return (
    <div className="dashboard-stock">
      {/* Bouton de retour intelligent */}
      <button 
        className="back-button"
        onClick={handleRetour}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          background: userRole === 'admin_principal' ? '#667eea' : '#48bb78',
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
          e.target.style.background = userRole === 'admin_principal' ? '#5a67d8' : '#38a169';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = userRole === 'admin_principal' ? '#667eea' : '#48bb78';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {userRole === 'admin_principal' ? 'Retour à l\'administration' : 'Retour à la gestion des stocks'}
      </button>

      <h1>Dashboard Stock</h1>
      
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Prix</th>
            <th>Valeur</th>
          </tr>
        </thead>
        <tbody>
          {produits.map(p => (
            <tr key={p.id}>
              <td>{p.nom}</td>
              <td>{p.quantite}</td>
              <td>{p.prix} €</td>
              <td>{p.quantite * p.prix} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardStock;