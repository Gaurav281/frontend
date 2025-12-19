import { useState } from 'react'
import { motion } from 'framer-motion'
import {contactAPI} from '../utils/api'
import toast from 'react-hot-toast'
import { 
  FiMail, FiPhone, FiMapPin, FiSend, 
  FiClock, FiMessageSquare, FiUser 
} from 'react-icons/fi'
import { FaWhatsapp, FaTelegram, FaInstagram, FaLinkedin } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
      await contactAPI.sendMessage(formData)
      toast.success('Message sent successfully!')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: <FiMail className="w-6 h-6" />,
      title: 'Email Us',
      details: ['5starclipp@gmail.com', '5starclipps@gmail.com'],
      color: 'bg-blue-500'
    },
    {
      icon: <FiPhone className="w-6 h-6" />,
      title: 'Call Us',
      details: ['01304600263'],
      color: 'bg-green-500'
    },
    {
      icon: <FiMapPin className="w-6 h-6" />,
      title: 'Visit Us',
      details: ['No. 3,RMZ Infinity-Tower E, 3rd floor', 'Bengaluru', 'India'],
      color: 'bg-purple-500'
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: 'Business Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'],
      color: 'bg-orange-500'
    }
  ]

  const socialLinks = [
    // {
    //   icon: <FaWhatsapp className="w-5 h-5" />,
    //   name: 'WhatsApp',
    //   href: 'https://wa.me/1234567890',
    //   color: 'hover:bg-green-500'
    // },
    {
      icon: <FaTelegram className="w-5 h-5" />,
      name: 'Telegram',
      href: 'https://t.me/FiveStarClips',
      color: 'hover:bg-blue-400'
    },
    // {
    //   icon: <FaInstagram className="w-5 h-5" />,
    //   name: 'Instagram',
    //   href: 'https://www.instagram.com/5starclipp?igsh=ZTgzdHI3bjk5NXR6',
    //   color: 'hover:bg-pink-600'
    // },
    // {
    //   icon: <FaLinkedin className="w-5 h-5" />,
    //   name: 'LinkedIn',
    //   href: 'https://linkedin.com/',
    //   color: 'hover:bg-blue-700'
    // }
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className={`${info.color} p-3 rounded-xl text-white mr-4`}>
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-bold">{info.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <li key={idx} className="text-gray-600 dark:text-gray-300">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-6">Connect With Us</h3>
              <div className="grid grid-cols-4 gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex items-center justify-center transition-all duration-300 hover:text-white`}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* FAQ Link */}
            <div className="card p-6 gradient-bg text-white">
              <h3 className="text-lg font-bold mb-3">Need Quick Answers?</h3>
              <p className="mb-4 opacity-90">
                Check our frequently asked questions
              </p>
              <a
                href="#"
                className="inline-flex items-center font-medium hover:underline"
              >
                View FAQ <FiMessageSquare className="ml-2" />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiUser className="inline mr-2" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMail className="inline mr-2" />
                      Email Address
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiPhone className="inline mr-2" />
                      Phone Number
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
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="billing">Billing Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field min-h-[150px] resize-none"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Subscribe to our newsletter for updates and offers
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-lg"
                >
                  <FiSend className="inline mr-2" />
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Map Placeholder */}
            <div className="card mt-8 overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Map Integration</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time Card */}
        <div className="gradient-bg rounded-2xl p-8 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Fast Response Time</h3>
            <p className="text-xl opacity-90 mb-6">
              We pride ourselves on quick responses. Most inquiries are answered within 1 hour during business hours.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold mb-2">1h</div>
                <div className="opacity-80">Avg. Response</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="opacity-80">Support Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="opacity-80">Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="opacity-80">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Contact