// frontend/src/pages/ServiceDetails.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  FiArrowLeft, FiCheckCircle, FiClock,
  FiUsers, FiStar, FiShield, FiChevronRight,
  FiCalendar, FiTool, FiGlobe
} from 'react-icons/fi'
import { FaRupeeSign } from "react-icons/fa";
import {useAuth} from '../hooks/useAuth'


const ServiceDetails = () => {
  const { id } = useParams()
  const {user } = useAuth();
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedServices, setRelatedServices] = useState([])

  useEffect(() => {
    fetchServiceDetails()
    fetchRelatedServices()
  }, [id])

  const fetchServiceDetails = async () => {
    try {
      const { data } = await api.get(`/services/${id}`)
      setService(data.service)
    } catch (error) {
      toast.error('Failed to load service details')
      navigate('/services')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedServices = async () => {
    try {
      const { data } = await api.get(`/services/related/${id}`)
      setRelatedServices(data.services)
    } catch (error) {
      console.error('Failed to fetch related services')
    }
  }

  const handleEnroll = () => {
    if (!user) {
      toast.error('Please login to enroll in this service')
      navigate('/login', { state: { from: `/services/${id}` } })
      return
    }

    if (!user.isVerified) {
      toast.error('Please verify your email first')
      return
    }

    navigate(`/payment/${id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Service not found</h2>
        <Link to="/services" className="btn-primary">
          Browse Services
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600"
        >
          <FiArrowLeft className="mr-2" />
          Back to Services
        </button>

        {/* Hero Section */}
        <div className="gradient-bg rounded-2xl p-8 text-white">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <FiStar className="mr-2" />
              <span className="font-medium">Premium Service</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{service.name}</h1>
            <p className="text-xl text-white/90 mb-8">{service.description}</p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <FiClock className="mr-2 text-xl" />
                <span className="font-medium">{service.duration}</span>
              </div>
              <div className="flex items-center">
                <FaRupeeSign className="mr-2 text-xl" />
                <span className="text-3xl font-bold">{service.price}</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="mr-2 text-xl" />
                <span className="font-medium">{service.enrolledCount || 0} enrolled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6">What's Included</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {service.features?.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <FiCheckCircle className="text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Feature {index + 1}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{feature}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6">How It Works</h2>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: 'Choose Service',
                    description: 'Select this service and proceed to payment',
                    icon: <FiTool />
                  },
                  {
                    step: 2,
                    title: 'Complete Payment',
                    description: 'Pay using UPI or any preferred method',
                    icon: <FaRupeeSign />
                  },
                  {
                    step: 3,
                    title: 'Service Activation',
                    description: 'Our team will activate your service within 24 hours',
                    icon: <FiGlobe />
                  },
                  {
                    step: 4,
                    title: 'Ongoing Support',
                    description: 'Get 24/7 support throughout the service period',
                    icon: <FiShield />
                  }
                ].map((step) => (
                  <div key={step.step} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-xl mr-6">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          {step.icon}
                        </div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="space-y-6">
            <div className="card p-8 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold gradient-text mb-2">₹{service.price}</div>
                <p className="text-gray-600 dark:text-gray-300">One-time payment</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Service Duration</span>
                  <span className="font-semibold">{service.duration}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Support</span>
                  <span className="font-semibold">24/7 Available</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Updates</span>
                  <span className="font-semibold">Free Updates</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 dark:text-gray-300">Money Back</span>
                  <span className="font-semibold">30 Days Guarantee</span>
                </div>
              </div>

              <button
                onClick={handleEnroll}
                className="btn-primary w-full py-4 text-lg font-semibold"
              >
                Enroll Now
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Secure payment • 30-day guarantee • Cancel anytime
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <FiShield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">Secure</p>
                  </div>
                  <div className="text-center">
                    <FiCalendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">24/7 Support</p>
                  </div>
                  <div className="text-center">
                    <FiStar className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">Premium</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Our support team is here to help you 24/7
              </p>
              <Link
                to="/contact"
                className="flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium"
              >
                Contact Support <FiChevronRight className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.slice(0, 3).map((relatedService) => (
                <Link
                  key={relatedService._id}
                  to={`/services/${relatedService._id}`}
                  className="card p-6 hover:shadow-xl transition-shadow"
                >
                  <h3 className="font-bold mb-2">{relatedService.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {relatedService.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold gradient-text">₹{relatedService.price}</span>
                    <span className="text-sm text-gray-500">{relatedService.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ServiceDetails