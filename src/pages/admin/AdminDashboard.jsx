// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import {
  FiUsers,
  FiPackage,
  FiCreditCard,
  FiActivity,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    pendingPayments: 0,
    activeServices: 0,
    totalRevenue: 0
  })

  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/payments/recent')
      ])

      if (statsRes.data.success) {
        const s = statsRes.data.stats
        setStats({
          totalUsers: s.totalUsers,
          totalServices: s.totalServices,
          pendingPayments: s.pendingPayments,
          activeServices: s.activeServices,
          totalRevenue: s.totalRevenue
        })
      }

      if (paymentsRes.data.success) {
        setRecentPayments(paymentsRes.data.payments)
      }
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FiUsers className="text-2xl" />,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: <FiPackage className="text-2xl" />,
      color: 'bg-green-500',
      link: '/admin/services'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: <FiCreditCard className="text-2xl" />,
      color: 'bg-yellow-500',
      link: '/admin/payments'
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: <FiActivity className="text-2xl" />,
      color: 'bg-purple-500',
      link: '/admin/services'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      icon: <FiDollarSign className="text-2xl" />,
      color: 'bg-indigo-500',
      link: '/admin/payments'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your digital services platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="card p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.color} rounded-lg text-white`}>
                  {stat.icon}
                </div>
                <FiTrendingUp className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {stat.title}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Payments */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between">
              <h2 className="text-xl font-bold">Recent Payments</h2>
              <Link
                to="/admin/payments"
                className="text-primary-600 dark:text-primary-400 text-sm font-medium"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentPayments.map(payment => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {payment.userId?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.transactionId?.slice(0, 8)}...
                        </p>
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        ${payment.serviceId?.price || 0}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            payment.paymentStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : payment.paymentStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.paymentStatus === 'approved' && (
                            <FiCheckCircle className="mr-1" />
                          )}
                          {payment.paymentStatus === 'rejected' && (
                            <FiAlertCircle className="mr-1" />
                          )}
                          {payment.paymentStatus === 'pending' && (
                            <FiCalendar className="mr-1" />
                          )}
                          {payment.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/admin/services"
                  className="p-4 gradient-bg rounded-lg text-white text-center"
                >
                  <FiPackage className="mx-auto mb-2" />
                  Add Service
                </Link>
                <Link
                  to="/admin/broadcast"
                  className="p-4 bg-blue-500 rounded-lg text-white text-center"
                >
                  <FiActivity className="mx-auto mb-2" />
                  Broadcast
                </Link>
                <Link
                  to="/admin/payments"
                  className="p-4 bg-green-500 rounded-lg text-white text-center"
                >
                  <FiCreditCard className="mx-auto mb-2" />
                  Payments
                </Link>
                <Link
                  to="/admin/users"
                  className="p-4 bg-purple-500 rounded-lg text-white text-center"
                >
                  <FiUsers className="mx-auto mb-2" />
                  Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
