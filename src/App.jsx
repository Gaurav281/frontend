import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import api from './utils/api'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingContact from './components/FloatingContact'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Payment from './pages/Payment'
import Contact from './pages/Contact'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServices from './pages/admin/AdminServices'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPayments from './pages/admin/AdminPayments'
import AdminBroadcast from './pages/admin/AdminBroadcast'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PaymentWithInstallment from './pages/PaymentWithInstallment'

function App() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [backendOnline, setBackendOnline] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const RETRY_TIME = 35

  const [retrySeconds, setRetrySeconds] = useState(RETRY_TIME)


  // 🔹 Initial backend check
  useEffect(() => {
    // 🔥 Always stop fullscreen loader after 2s
    const uiTimer = setTimeout(() => {
      setInitialLoading(false)
    }, 1500)

    // 🚀 Wake backend in background (NON-BLOCKING)
    api.get('/health')
      .then(() => {
        setBackendOnline(true)
        return api.get('/broadcast/active')
      })
      .then(({ data }) => {
        if (data?.message) setBroadcastMessage(data.message)
      })
      .catch(() => {
        setBackendOnline(false)
      })

    return () => clearTimeout(uiTimer)
  }, [])


  // 🔁 Retry backend every 45s if offline
  useEffect(() => {
    if (backendOnline) return

    // ⏳ Countdown timer (UI)
    setRetrySeconds(RETRY_TIME)

    const countdown = setInterval(() => {
      setRetrySeconds(prev => {
        if (prev <= 1) return RETRY_TIME
        return prev - 1
      })
    }, 1000)

    // 🔁 Backend retry
    const retry = setInterval(async () => {
      try {
        await api.get('/health')
        setBackendOnline(true)

        const { data } = await api.get('/broadcast/active')
        if (data?.message) setBroadcastMessage(data.message)

        clearInterval(countdown)
        clearInterval(retry)
      } catch {
        // still sleeping → wait next cycle
      }
    }, RETRY_TIME * 1000)

    return () => {
      clearInterval(countdown)
      clearInterval(retry)
    }
  }, [backendOnline])



  /* ================= FULLSCREEN LOADER (ONLY 2s) ================= */
  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white text-black z-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Starting server… please wait</p>
        </div>
      </div>
    )
  }


  return (
    <Router>
      <div className="min-h-screen flex flex-col">

        {/* 🔴 TOP BACKEND LOADER (NON-BLOCKING) */}
        {!backendOnline && (
          <div className="bg-yellow-500 text-black text-sm py-2 text-center">
            ⚠️ Server is starting… retrying in <span className="font-bold">{retrySeconds}s</span>
          </div>
        )}

        <Navbar />

        {backendOnline && broadcastMessage && (
          <div className="gradient-bg text-white py-2 px-4 text-center">
            <p className="font-medium">📢 {broadcastMessage}</p>
          </div>
        )}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />

            {/* Profile Route */}
            <Route path="/profile" element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Password Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/payment/:serviceId" element={<PaymentWithInstallment />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/broadcast" element={<AdminBroadcast />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <FloatingContact />
        <Toaster />
      </div>
    </Router>
  )
}

export default App