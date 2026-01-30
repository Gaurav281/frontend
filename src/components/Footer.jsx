import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { FaTelegram } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Dashboard', path: '/dashboard' }
  ]

  const services = [
    'SaaS Tools',
    'Social Media Management',
    'SEO Services',
    'Web Development',
    'Digital Marketing'
  ]

  const socialLinks = [
    // { icon: <FiFacebook />, name: 'Facebook', link: 'https://www.facebook.com/5starclipp' },
    { icon: <FaWhatsapp />, name: 'Whatsapp', link: 'https://wa.me/9499141536' },
    // { icon: <FiTwitter />, name: 'Twitter' , link: 'https://twitter.com/5starclipp' },
    // { icon: <FiInstagram />, name: 'Instagram' , link: 'https://www.instagram.com/5starclipp?igsh=ZTgzdHI3bjk5NXR6'},
    { icon: <FaTelegram />, name: 'Telegram', link: 'https://t.me/FiveStarClips' }
    // { icon: <FiLinkedin />, name: 'LinkedIn', link: 'https://www.linkedin.com/company/5starclipp' }
  ]

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="gradient-bg w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold">5StarClip Production</span>
            </div>
            <p className="text-gray-400 mb-6">
              Premium digital solutions for modern businesses. Transforming ideas into reality.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  to={`${social.link}`}
                  className="w-10 h-10 bg-gray-700 hover:gradient-bg rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a href="/services" className="text-gray-400 hover:text-white transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FiMail className="mt-1 mr-3 text-gray-400" />
                <span className="text-gray-400">5starclipp@gmail.com</span>
              </li>
              <li className="flex items-start">
                <FiPhone className="mt-1 mr-3 text-gray-400" />
                <span className="text-gray-400">01304600263</span>
              </li>
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-gray-400" />
                <span className="text-gray-400">Office No. 302, 3rd Floor, Gopalkrupa, behind Surabhi Hotel, Revenue Colony, Shivajinagar, Pune, Maharashtra 411005</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center space-y-3">
          <p className="text-gray-400">
            © {currentYear} 5StarClip Production. All rights reserved.
          </p>

          <div className="flex justify-center space-x-6 text-sm">
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-white transition"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition"
            >
              Terms & Conditions
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            Premium Digital Solutions Provider
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer