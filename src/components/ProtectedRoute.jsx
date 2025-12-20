// frontend/src/components/ProtectedRoute.jsx
import {useState , useEffect} from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  // Add a slight delay to ensure auth state is loaded
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsChecking(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading])

  if (loading || isChecking) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.isVerified) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute