// src/pages/finance/DashboardFinancier.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import { transactionService } from '../../services/transactionService';
import './DashboardFinancier.css';

const DashboardFinancier = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenu: 0, totalDepense: 0 });
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
      const res = await transactionService.getAll({ limit: 20, sortBy: 'createdAt', order: 'desc' });
      const txList = res.data || res.transactions || [];
      setTransactions(txList);

      let totalRevenu = 0;
      let totalDepense = 0;
      txList.forEach(t => {
        if (t.type === 'recette' || t.type === 'revenu') totalRevenu += t.totalDebit || t.amount || 0;
        if (t.type === 'dépense' || t.type === 'depense') totalDepense += t.totalCredit || t.amount || 0;
      });
      setStats({ totalRevenu, totalDepense });
    } catch (err) {
      setError('Impossible de charger les données financières.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetour = () => {
    if (userRole === 'admin_principal') navigate('/admin');
    else if (userRole === 'admin_finance') navigate('/finance');
    else navigate('/');
  };

  return (
    <div className="dashboard-financier">
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
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {userRole === 'admin_principal' ? 'Retour à l\'administration' : 'Retour à la gestion financière'}
      </button>

      <h1>Dashboard Financier</h1>

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
            <div className="stat-card revenu">
              <h3>Revenus</h3>
              <p>{stats.totalRevenu.toFixed(2)} DT</p>
            </div>
            <div className="stat-card depense">
              <h3>Dépenses</h3>
              <p>{stats.totalDepense.toFixed(2)} DT</p>
            </div>
            <div className="stat-card benefice">
              <h3>Bénéfice</h3>
              <p>{(stats.totalRevenu - stats.totalDepense).toFixed(2)} DT</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Débit</th>
                <th>Crédit</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Aucune transaction</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t._id}>
                    <td>{new Date(t.createdAt || t.date).toLocaleDateString('fr-FR')}</td>
                    <td>{t.description || '-'}</td>
                    <td>{(t.totalDebit || 0).toFixed(2)} DT</td>
                    <td>{(t.totalCredit || 0).toFixed(2)} DT</td>
                    <td>{t.status || '-'}</td>
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

export default DashboardFinancier;
