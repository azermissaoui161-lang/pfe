import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {
  // Pour l'instant, simulation d'authentification
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}

export default ProtectedRoute
