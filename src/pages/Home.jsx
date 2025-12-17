import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiArrowRight, FiShield, FiClock, FiTrendingUp } from 'react-icons/fi'
import { HiOutlineLightningBolt, HiOutlineChatAlt2 } from 'react-icons/hi'

const Home = () => {
  const services = [
    {
      name: 'SaaS Tools',
      description: 'Custom software solutions for your business',
      icon: <HiOutlineLightningBolt className="w-8 h-8" />,
      features: ['Custom Development', 'Cloud Hosting', 'API Integration']
    },
    {
      name: 'Social Media Management',
      description: 'Grow your social media presence',
      icon: <HiOutlineChatAlt2 className="w-8 h-8" />,
      features: ['Content Strategy', 'Analytics', 'Community Management']
    },
    {
      name: 'SEO Services',
      description: 'Boost your website rankings',
      icon: <FiTrendingUp className="w-8 h-8" />,
      features: ['Keyword Research', 'Technical SEO', 'Content Optimization']
    }
  ]

  const features = [
    {
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime',
      icon: <FiShield />
    },
    {
      title: 'Fast Delivery',
      description: 'Quick setup and deployment within hours',
      icon: <FiClock />
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support',
      icon: <HiOutlineChatAlt2 />
    }
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Digital Solutions</span> for Modern Businesses
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Transform your digital presence with our premium services. From SaaS tools to social media management, we deliver excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services" className="btn-primary inline-flex items-center justify-center">
                Explore Services <FiArrowRight className="ml-2" />
              </Link>
              <Link to="/contact" className="btn-secondary inline-flex items-center justify-center">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Premium Services</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our range of digital services designed to elevate your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 hover:scale-105"
              >
                <div className="gradient-text mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3">{service.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <FiCheckCircle className="text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/services"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center"
                >
                  Learn More <FiArrowRight className="ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 gradient-bg rounded-full mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who have elevated their digital presence with us.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center bg-white text-gray-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300"
          >
            Get Started Now <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home