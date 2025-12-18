import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiUserCheck,
  FiHome,
  FiGrid,
  FiPhone
} from 'react-icons/fi'
import { HiOutlineCog } from 'react-icons/hi'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    setDropdownOpen(false)
    setIsOpen(false)
    logout()
    navigate('/')
  }

  const isActive = (path) =>
    location.pathname === path
      ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-500'
      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'

  const isActiveMobile = (path) =>
    location.pathname === path
      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div>
              <img
                src="/logo.svg"
                alt="5StarClip Logo"
                className="w-12 h-35"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold gradient-text">
                5StarClip
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Production
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">

            <Link to="/" className={`flex items-center space-x-1 ${isActive('/')}`}>
              <FiHome />
              <span>Home</span>
            </Link>

            <Link to="/services" className={`flex items-center space-x-1 ${isActive('/services')}`}>
              <FiGrid />
              <span>Services</span>
            </Link>

            <Link to="/contact" className={`flex items-center space-x-1 ${isActive('/contact')}`}>
              <FiPhone />
              <span>Contact</span>
            </Link>

            {user && (
              <Link to="/dashboard" className={`flex items-center space-x-1 ${isActive('/dashboard')}`}>
                <FiUserCheck />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
                >
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                    <FiUser className="text-white" />
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                  >
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HiOutlineCog className="mr-3" />
                        Admin Panel
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiUser className="mr-3" />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="mr-3" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="md:hidden text-gray-700 dark:text-gray-300"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="py-4 space-y-2">

              <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2 rounded ${isActiveMobile('/')}`}>
                <FiHome className="mr-2" /> Home
              </Link>

              <Link to="/services" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2 rounded ${isActiveMobile('/services')}`}>
                <FiGrid className="mr-2" /> Services
              </Link>

              <Link to="/contact" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2 rounded ${isActiveMobile('/contact')}`}>
                <FiPhone className="mr-2" /> Contact
              </Link>

              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2 rounded ${isActiveMobile('/profile')}`}>
                    <FiUser className="mr-2" /> Profile
                  </Link>

                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2 rounded ${isActiveMobile('/dashboard')}`}>
                    <FiUserCheck className="mr-2" /> Dashboard
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2 rounded ${isActiveMobile('/admin')}`}>
                      <HiOutlineCog className="mr-2" /> Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-2 gradient-text font-semibold">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
