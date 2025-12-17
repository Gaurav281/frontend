import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiMail, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.success) {
      setEmailSent(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              {emailSent ? 'Check Your Email' : 'Forgot Password'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {emailSent 
                ? 'We have sent password reset instructions to your email'
                : 'Enter your email to receive password reset instructions'}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">
                  Check Your Inbox
                </h3>
                <p className="text-green-700 dark:text-green-400">
                  We've sent password reset instructions to <span className="font-semibold">{email}</span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-4">
                  The reset link will expire in 30 minutes
                </p>
              </div>

              <button
                onClick={() => setEmailSent(false)}
                className="btn-secondary w-full py-3"
              >
                Try Another Email
              </button>
            </div>
          )}

          <p className="text-center mt-8 text-gray-600 dark:text-gray-300">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you don't receive an email, check your spam folder or contact support
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;