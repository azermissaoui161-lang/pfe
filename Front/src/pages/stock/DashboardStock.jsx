// src/pages/stock/DashboardStock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../utils/auth';
import productService from '../../services/productService';
import './DashboardStock.css';

const DashboardStock = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0, lowStock: 0, outOfStock: 0 });
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
      const [productsRes, statsRes] = await Promise.all([
        productService.getAll({ limit: 20 }),
        productService.getStats()
      ]);
      setProduits(productsRes.products || []);
      setStats(statsRes || {});
    } catch (err) {
      setError('Impossible de charger les données de stock.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetour = () => {
    if (userRole === 'admin_principal') navigate('/admin');
    else if (userRole === 'admin_stock') navigate('/stock');
    else navigate('/');
  };

  const getStatusStyle = (status) => {
    if (status === 'rupture') return { color: '#e53e3e', fontWeight: 'bold' };
    if (status === 'stock faible') return { color: '#dd6b20', fontWeight: 'bold' };
    return { color: '#276749' };
  };

  return (
    <div className="dashboard-stock">
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
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {userRole === 'admin_principal' ? 'Retour à l\'administration' : 'Retour à la gestion des stocks'}
      </button>

      <h1>Dashboard Stock</h1>

      {error && (
        <div style={{ background: '#fed7d7', color: '#742a2a', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ background: '#ebf8ff', padding: '16px', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
              <h3 style={{ margin: 0, color: '#2b6cb0', fontSize: '0.9rem' }}>Total Produits</h3>
              <p style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#2b6cb0' }}>{stats.totalProducts || 0}</p>
            </div>
            <div style={{ background: '#f0fff4', padding: '16px', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
              <h3 style={{ margin: 0, color: '#276749', fontSize: '0.9rem' }}>Valeur Totale</h3>
              <p style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#276749' }}>{(stats.totalValue || 0).toFixed(2)} DT</p>
            </div>
            <div style={{ background: '#fffff0', padding: '16px', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
              <h3 style={{ margin: 0, color: '#744210', fontSize: '0.9rem' }}>Stock Faible</h3>
              <p style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#744210' }}>{stats.lowStock || 0}</p>
            </div>
            <div style={{ background: '#fff5f5', padding: '16px', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
              <h3 style={{ margin: 0, color: '#c53030', fontSize: '0.9rem' }}>Rupture</h3>
              <p style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#c53030' }}>{stats.outOfStock || 0}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Quantité</th>
                <th>Stock Min</th>
                <th>Prix</th>
                <th>Valeur</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {produits.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Aucun produit</td></tr>
              ) : (
                produits.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.stock}</td>
                    <td>{p.minStock}</td>
                    <td>{(p.price || 0).toFixed(2)} DT</td>
                    <td>{((p.price || 0) * (p.stock || 0)).toFixed(2)} DT</td>
                    <td style={getStatusStyle(p.status)}>{p.status}</td>
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

export default DashboardStock;
