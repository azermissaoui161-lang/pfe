// src/pages/facturation/DashboardFacturation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import { invoiceService } from '../../services/invoiceService';
import './DashboardFacturation.css';

const DashboardFacturation = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [factures, setFactures] = useState([]);
  const [totals, setTotals] = useState({ totalHT: 0, totalTTC: 0, totalPaid: 0, totalDue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await invoiceService.getAll({ limit: 20, sortBy: 'createdAt', order: 'desc' });
      setFactures(res.data || []);
      if (res.totals) setTotals(res.totals);
    } catch (err) {
      setError('Impossible de charger les données de facturation.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetour = () => {
    if (userRole === 'admin_principal') navigate('/admin');
    else if (userRole === 'admin_facture') navigate('/facturation');
    else navigate('/');
  };

  const getStatutStyle = (status) => {
    const map = {
      'payée': 'paye',
      'brouillon': 'brouillon',
      'envoyée': 'envoyee',
      'en_retard': 'retard',
      'annulée': 'annulee',
      'partiellement_payée': 'partiel'
    };
    return map[status] || 'attente';
  };

  return (
    <div className="dashboard-facturation">
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
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {userRole === 'admin_principal' ? 'Retour à l\'administration' : 'Retour à la gestion des factures'}
      </button>

      <h1>Dashboard Facturation</h1>

      {error && (
        <div style={{ background: '#fed7d7', color: '#742a2a', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat-card">
              <h3>Total Factures</h3>
              <p>{factures.length}</p>
            </div>
            <div className="stat-card">
              <h3>Montant TTC</h3>
              <p>{(totals.totalTTC || 0).toFixed(2)} DT</p>
            </div>
            <div className="stat-card">
              <h3>Payé</h3>
              <p>{(totals.totalPaid || 0).toFixed(2)} DT</p>
            </div>
            <div className="stat-card">
              <h3>Reste dû</h3>
              <p>{(totals.totalDue || 0).toFixed(2)} DT</p>
            </div>
          </div>

          <table className="factures-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Montant TTC</th>
                <th>Payé</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {factures.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Aucune facture</td></tr>
              ) : (
                factures.map((facture) => (
                  <tr key={facture._id}>
                    <td>{facture.invoiceNumber}</td>
                    <td>{facture.customer ? `${facture.customer.firstName} ${facture.customer.lastName}` : '-'}</td>
                    <td>{(facture.totalTTC || 0).toFixed(2)} DT</td>
                    <td>{(facture.amountPaid || 0).toFixed(2)} DT</td>
                    <td>{new Date(facture.date || facture.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`statut ${getStatutStyle(facture.status)}`}>
                        {facture.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DashboardFacturation;
