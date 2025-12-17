//frontend/src/components/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const AdminRoute = () => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  // Prevent duplicate toasts
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated && !hasShownToast.current) {
      toast.error('Please login to access admin panel')
      hasShownToast.current = true
    }

    if (isAuthenticated && !isAdmin && !hasShownToast.current) {
      toast.error('Access denied. Admin privileges required')
      hasShownToast.current = true
    }
  }, [loading, isAuthenticated, isAdmin])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminRoute
