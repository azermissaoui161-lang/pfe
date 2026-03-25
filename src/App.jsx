import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Admin from './pages/admin/Admin';
import StockAdmin from './pages/stock/StockAdmin';
import FinanceAdmin from './pages/finance/FinanceAdmin';
import FacturationAdmin from './pages/facturation/FacturationAdmin';
import Dashboard from './pages/pdashbord/Dashboard';
import { isAuthenticated, getUserRole, getHomePathForRole } from './utils/auth';

const ProtectedRoute = ({ children, allowedRole }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }

  return children;
};

const RedirectToHome = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePathForRole(getUserRole())} replace />;
};

const FallbackRoute = () => {
  return isAuthenticated()
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin_principal">
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute allowedRole="admin_stock">
              <StockAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRole="admin_finance">
              <FinanceAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/facturation"
          element={
            <ProtectedRoute allowedRole="admin_facture">
              <FacturationAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="/admin_principal" element={<Navigate to="/admin" replace />} />
        <Route path="/admin_stock" element={<Navigate to="/stock" replace />} />
        <Route path="/admin_finance" element={<Navigate to="/finance" replace />} />
        <Route path="/admin_facture" element={<Navigate to="/facturation" replace />} />

        <Route path="/" element={<RedirectToHome />} />
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;