//frontend/src/components/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const AdminRoute = () => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  // Prevent duplicate toasts
  const hasShownToast = useRef(false)

   useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsChecking(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading])

  useEffect(() => {
    if (loading || isChecking) return

    if (!isAuthenticated && !hasShownToast.current) {
      toast.error('Please login to access admin panel')
      hasShownToast.current = true
    }

    if (isAuthenticated && !isAdmin && !hasShownToast.current) {
      toast.error('Access denied. Admin privileges required')
      hasShownToast.current = true
    }
  }, [loading, isChecking ,isAuthenticated, isAdmin])

  if (loading || isChecking) {
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
