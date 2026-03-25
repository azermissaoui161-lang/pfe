import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getUserEmail, getUserRole, getHomePathForRole, isAuthenticated } from '../../utils/auth';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const email = getUserEmail();
  const role = getUserRole();
  const auth = isAuthenticated();

  useEffect(() => {
    if (!auth) {
      navigate('/login', { replace: true });
    }
  }, [auth, navigate]);

  if (!auth) return null;

  const homePath = getHomePathForRole(role);

  const links = [
    { to: '/admin', label: 'Admin Principal', role: 'admin_principal' },
    { to: '/stock', label: 'Stock', role: 'admin_stock' },
    { to: '/finance', label: 'Finance', role: 'admin_finance' },
    { to: '/facturation', label: 'Facturation', role: 'admin_facture' }
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h1>Bienvenue</h1>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Role:</strong> {role}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <Link to={homePath}>Aller a mon espace</Link>
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                pointerEvents: role === item.role ? 'auto' : 'none',
                opacity: role === item.role ? 1 : 0.45
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className="logout-btn" style={{ marginTop: 16 }}>
          Deconnexion
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
