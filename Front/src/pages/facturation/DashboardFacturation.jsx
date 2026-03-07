// src/pages/facturation/DashboardFacturation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import './DashboardFacturation.css';

const DashboardFacturation = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [factures] = useState([
    { id: 1, client: 'Client A', montant: 1500, date: '2024-01-15', statut: 'Payée' },
    { id: 2, client: 'Client B', montant: 2300, date: '2024-01-16', statut: 'En attente' },
    { id: 3, client: 'Client C', montant: 850, date: '2024-01-17', statut: 'Payée' },
  ]);

  // Récupérer le rôle de l'utilisateur au chargement
  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    console.log("Rôle utilisateur:", role);
  }, []);

  // Fonction de retour intelligente
  const handleRetour = () => {
    console.log("Redirection depuis DashboardFacturation - Rôle:", userRole);
    
    // Si admin_principal → retour vers /admin
    if (userRole === 'admin_principal') {
      navigate('/admin');
    } 
    // Si admin_facture → retour vers /facturation
    else if (userRole === 'admin_facture') {
      navigate('/facturation');
    }
    // Fallback (au cas où)
    else {
      navigate('/');
    }
  };

  return (
    <div className="dashboard-facturation">
      {/* Bouton de retour intelligent */}
      <button 
        className="back-button"
        onClick={handleRetour}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          background: userRole === 'admin_principal' ? '#667eea' : '#f59e0b',
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
          e.target.style.background = userRole === 'admin_principal' ? '#5a67d8' : '#e67e22';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = userRole === 'admin_principal' ? '#667eea' : '#f59e0b';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {userRole === 'admin_principal' ? 'Retour à l\'administration' : 'Retour à la gestion des factures'}
      </button>

      <h1>Dashboard Facturation</h1>
      
      <div className="stats">
        <div className="stat-card">
          <h3>Total Factures</h3>
          <p>{factures.length}</p>
        </div>
        <div className="stat-card">
          <h3>Montant Total</h3>
          <p>
            {factures.reduce((total, facture) => total + facture.montant, 0)} €
          </p>
        </div>
      </div>

      <table className="factures-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Montant</th>
            <th>Date</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {factures.map((facture) => (
            <tr key={facture.id}>
              <td>{facture.client}</td>
              <td>{facture.montant} €</td>
              <td>{facture.date}</td>
              <td>
                <span className={`statut ${facture.statut === 'Payée' ? 'paye' : 'attente'}`}>
                  {facture.statut}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardFacturation;