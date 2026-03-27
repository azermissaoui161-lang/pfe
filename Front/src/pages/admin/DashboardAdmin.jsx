// src/pages/admin/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import userService from '../../services/userService';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, products: 0, invoices: 0, customers: 0, suppliers: 0, revenue: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersRes = await userService.getAll({ limit: 5 });
      const users = usersRes.data || [];
      setRecentUsers(users);
      setStats(prev => ({ ...prev, users: usersRes.pagination?.total || users.length }));
    } catch (err) {
      setError('Impossible de charger les données du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (role) => {
    const map = {
      admin_principal: 'Admin Principal',
      admin_facture: 'Admin Facturation',
      admin_stock: 'Admin Stock',
      admin_finance: 'Admin Finance',
      employe: 'Employé'
    };
    return map[role] || role;
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', color: '#1a202c' }}>Dashboard Administrateur</h1>

      {error && (
        <div style={{ background: '#fed7d7', color: '#742a2a', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div style={{ background: '#667eea', color: 'white', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '140px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.users}</div>
              <div style={{ opacity: 0.9, marginTop: '4px' }}>Utilisateurs</div>
            </div>
            <div style={{ background: '#48bb78', color: 'white', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '140px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/stock')}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>Stock</div>
              <div style={{ opacity: 0.9, marginTop: '4px' }}>Gestion Stock</div>
            </div>
            <div style={{ background: '#f59e0b', color: 'white', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '140px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/facturation')}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>Facturation</div>
              <div style={{ opacity: 0.9, marginTop: '4px' }}>Factures & Paiements</div>
            </div>
            <div style={{ background: '#4299e1', color: 'white', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '140px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/finance')}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>Finance</div>
              <div style={{ opacity: 0.9, marginTop: '4px' }}>Comptabilité</div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '16px', color: '#4a5568', fontSize: '1.1rem' }}>Utilisateurs récents</h2>
            {recentUsers.length === 0 ? (
              <p style={{ color: '#718096' }}>Aucun utilisateur</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Nom</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Rôle</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: '#4a5568' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 8px' }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: '10px 8px', color: '#718096' }}>{u.email}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ color: u.isActive ? '#276749' : '#c53030', fontWeight: 500 }}>
                          {u.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;
