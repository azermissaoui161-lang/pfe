import { Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/auth/Login"
import Dashboard from "../pages/pdashbord/Dashboard"
import ProtectedRoute from "./ProtectedRoute"

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default AppRouter
