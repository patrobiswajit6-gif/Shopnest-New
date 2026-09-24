import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Wait until session is restored from JWT before deciding to redirect
  if (loading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
          Verifying session…
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }

  return children
}
