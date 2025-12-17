// frontend/src/pages/Signup.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiMail, FiLock, FiUser,FiPlus, FiCheckCircle,  FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, sendOTP, verifyOTP } = useAuth();
  const [socialMedia, setSocialMedia] = useState([{ platform: 'youtube', url: '' }]);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add these functions:
  const addSocialMedia = () => {
    setSocialMedia([...socialMedia, { platform: 'facebook', url: '' }]);
  };

  const updateSocialMedia = (index, field, value) => {
    const updated = [...socialMedia];
    updated[index][field] = value;
    setSocialMedia(updated);
  };

  const removeSocialMedia = (index) => {
    const updated = [...socialMedia];
    updated.splice(index, 1);
    setSocialMedia(updated);
  };


  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const signupData = {
      ...formData,
      socialMedia: socialMedia.filter(sm => sm.url.trim() !== '')
    };

    const result = await signup(signupData);
    await sendOTP(formData.email);

    if (result.success) {
      setStep(2);
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyOTP(formData.email, otp);

    if (result.success) {
      // Allow AuthContext to update before route change
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 0);
    }



    setLoading(false);
  };

  const handleResendOtp = async () => {
    const result = await sendOTP(formData.email);
    if (result.success) {
      // Toast is shown by the hook
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-300">Join our premium digital services</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'gradient-bg text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {step > 1 ? <FiCheckCircle /> : '1'}
              </div>
              <div className={`ml-2 ${step >= 1 ? 'font-semibold' : ''}`}>Details</div>
            </div>
            <div className={`h-1 w-16 mx-4 ${step >= 2 ? 'gradient-bg' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'gradient-bg text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                2
              </div>
              <div className={`ml-2 ${step >= 2 ? 'font-semibold' : ''}`}>Verify</div>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}  
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Social Media Links (Optional)
                  </label>
                  <div className="space-y-3">
                    {socialMedia.map((link, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <select
                          value={link.platform}
                          onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                          className="input-field flex-shrink-0 w-32"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                          className="input-field flex-1"
                          placeholder="https://example.com/profile"
                        />
                        {socialMedia.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSocialMedia(index)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSocialMedia}
                      className="flex items-center text-primary-600 dark:text-primary-400 text-sm"
                    >
                      <FiPlus className="mr-1" />
                      Add more social media link
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMail className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Verify Your Email</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We've sent a 6-digit OTP to <span className="font-semibold">{formData.email}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2"
                  >
                    Resend OTP
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    OTP will expire in 10 minutes
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn-primary w-full py-3"
                  >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary w-full py-3"
                  >
                    Back to Details
                  </button>
                </div>
              </div>
            </form>
          )}

          <p className="text-center mt-8 text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;