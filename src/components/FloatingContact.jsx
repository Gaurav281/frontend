import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiMessageSquare, FiX, 
  FiSend, FiMail, FiPhone, FiUser 
} from 'react-icons/fi'
import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await api.post('/contact', formData)
      toast.success('Message sent successfully!')
      setFormData({ name: '', email: '', phone: '', message: '' })
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const socialLinks = [
    // {
    //   icon: <FaWhatsapp className="w-5 h-5" />,
    //   label: 'WhatsApp',
    //   href: 'https://wa.me/1234567890',
    //   color: 'bg-green-500 hover:bg-green-600'
    // },
    {
      icon: <FaTelegram className="w-5 h-5" />,
      label: 'Telegram',
      href: 'https://t.me/FiveStarClips',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: <FaInstagram className="w-5 h-5" />,
      label: 'Instagram',
      href: 'https://www.instagram.com/5starclipp?igsh=ZTgzdHI3bjk5NXR6',
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ]

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 gradient-bg text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
      >
        <FiMessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Social Media Links */}
      <div className="fixed bottom-32 right-6 z-40 space-y-3">
        {socialLinks.map((social) => (
          <motion.a
            key={social.label}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${social.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center`}
            title={social.label}
          >
            {social.icon}
          </motion.a>
        ))}
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold gradient-text">Contact Us</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We'll get back to you within 24 hours
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiUser className="inline mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMail className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  <FiSend className="inline mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingContact