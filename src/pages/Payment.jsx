import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useServices from '../hooks/useServices';
import usePayments from '../hooks/usePayments';
import {
  FiCopy, FiCheck, FiArrowLeft, FiCreditCard,
  FiShield, FiClock, FiDollarSign, FiAlertCircle
} from 'react-icons/fi';

const Payment = () => {
  const { user, loading: authLoading } = useAuth();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { getServiceById } = useServices();
  const { createPayment, generateQRCode, loading } = usePayments();

  const [service, setService] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const upiId = import.meta.env.VITE_UPI_ID || 'payments@upi';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    } else {
      fetchServiceDetails();
      generateQR();
    }
  }, [authLoading, user, serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const result = await getServiceById(serviceId);
      if (result.success) {
        setService(result.service);
      } else {
        toast.error('Failed to load service details');
        navigate('/services');
      }
    } catch (error) {
      console.error('Failed to fetch service:', error);
      navigate('/services');
    }
  };

  const generateQR = async () => {
    if (!service) return;
    
    try {
      const result = await generateQRCode(serviceId);
      if (result.success) {
        setQrCode(result.data.qrCode);
      }
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setSubmitting(true);

    try {
      // Make sure we're sending the correct data structure
      const paymentData = {
        serviceId: serviceId, // String ID from useParams
        transactionId: transactionId.trim(),
        paymentType: 'full' // Default to full payment
      };

      const result = await createPayment(paymentData);
      if (result.success) {
        toast.success('Payment submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error.response?.data?.message || 'Payment submission failed';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" />
            Back to Service
          </button>
          <h1 className="text-3xl font-bold gradient-text">Complete Payment</h1>
          <div></div>
        </div>

        {/* Debug Info */}
        {/* <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Service ID:</strong> {serviceId}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Amount:</strong> ₹{service.price}
            </div>
          </div>
        </div> */}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Details */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Service Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Service Name</span>
                  <span className="font-semibold">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Duration</span>
                  <span>{service.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Amount</span>
                  <span className="text-2xl font-bold gradient-text">₹{service.price}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Payment Instructions</h2>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold mr-3">
                    1
                  </div>
                  <span>Scan the QR code or use UPI ID to pay ₹{service.price}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold mr-3">
                    2
                  </div>
                  <span>Save the transaction ID from your payment app</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold mr-3">
                    3
                  </div>
                  <span>Enter the transaction ID below and submit</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold mr-3">
                    4
                  </div>
                  <span>Payment will be verified within 24 hours</span>
                </li>
              </ol>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <FiAlertCircle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Important</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Make sure the transaction ID is correct. Incorrect IDs will result in payment rejection.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <FiShield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
              </div>
              <div className="card p-4 text-center">
                <FiClock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">24/7 Support</p>
              </div>
              <div className="card p-4 text-center">
                <FiDollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Money Back</p>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Interface */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="card p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Scan to Pay</h2>
              {qrCode ? (
                <div className="mb-4">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Amount: ₹{service.price}
                  </p>
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
              )}
            </div>

            {/* UPI ID */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Or Use UPI ID</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <code className="font-mono text-lg">{upiId}</code>
                <button
                  onClick={() => copyToClipboard(upiId)}
                  className="flex items-center px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {copied ? <FiCheck className="mr-2" /> : <FiCopy className="mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Transaction ID Form */}
            <form onSubmit={handleSubmitPayment} className="card p-6">
              <h2 className="text-xl font-bold mb-4">Submit Payment</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="input-field"
                  placeholder="Enter transaction ID from your payment app"
                  required
                  disabled={submitting}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  You can find this in your payment app's transaction history
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={submitting || !transactionId.trim()}
                  className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Submit Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/services/${serviceId}`)}
                  className="btn-secondary w-full py-3"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                By submitting, you agree to our terms and conditions
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;