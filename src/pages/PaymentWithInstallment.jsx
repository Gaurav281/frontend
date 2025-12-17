import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useServices from '../hooks/useServices';
import usePayments from '../hooks/usePayments';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiCopy, FiCheck, FiArrowLeft, FiCreditCard,
  FiShield, FiClock, FiDollarSign, FiPercent,
  FiCalendar, FiAlertCircle, FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';

const PaymentWithInstallment = () => {
  const { user } = useAuth();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { getServiceById } = useServices();
  const { generateQRCode, createPayment } = usePayments();

  const [service, setService] = useState(null);
  const [paymentType, setPaymentType] = useState('full');
  const [qrCode, setQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [installmentDetails, setInstallmentDetails] = useState(null);
  const [userInstallmentEnabled, setUserInstallmentEnabled] = useState(false);
  const [checkingInstallment, setCheckingInstallment] = useState(true);

  const upiId = import.meta.env.VITE_UPI_ID || 'payments@upi';

  useEffect(() => {
    fetchServiceDetails();
    checkUserInstallmentStatus();
  }, [serviceId, user]);

  useEffect(() => {
    if (service) {
      generateQR();
    }
  }, [service, paymentType]);

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
      toast.error('Failed to load service details');
      navigate('/services');
    }
  };

  const checkUserInstallmentStatus = async () => {
    if (!user) return;
    
    try {
      setCheckingInstallment(true);
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        
        const isEnabled = data.user.installmentSettings?.enabled === true;
        const isSuspicious = data.user.isSuspicious === true;
        
        // If user is suspicious, disable installments regardless of settings
        if (isSuspicious) {
          setUserInstallmentEnabled(false);
          toast.error('Your account is marked as suspicious. Installment payments are disabled.');
        } else {
          setUserInstallmentEnabled(isEnabled);
        }
        
        // Set installment details if enabled
        if (isEnabled && !isSuspicious && data.user.installmentSettings?.splits) {
          setInstallmentDetails(data.user.installmentSettings.splits);
        }
      }
    } catch (error) {
      console.error('Failed to check installment status:', error);
      setUserInstallmentEnabled(false);
    } finally {
      setCheckingInstallment(false);
    }
  };

  const generateQR = async () => {
    if (!service) return;
    
    let amount = service.price;
    if (paymentType === 'installment' && userInstallmentEnabled) {
      // Use splits if available, otherwise default to 30%
      if (installmentDetails && installmentDetails.length > 0) {
        const firstSplit = installmentDetails[0];
        amount = (service.price * (firstSplit.percentage || 30)) / 100;
      } else {
        amount = service.price * 0.3;
      }
    }
    
    try {
      const { data } = await api.get(`/payments/qr/${serviceId}?amount=${amount}`);
      if (data.success) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Failed to generate QR:', error);
      toast.error('Failed to generate QR code');
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

    setLoading(true);

    try {
      // IMPORTANT: Make sure serviceId is a string, not an object
      const paymentData = {
        serviceId: serviceId, // This should be the string ID from useParams
        transactionId: transactionId.trim(),
        paymentType: paymentType
      };

      const result = await createPayment(paymentData);
      
      if (result.success) {
        toast.success(paymentType === 'installment' 
          ? 'First installment payment submitted successfully!' 
          : 'Payment submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.errors?.[0]?.msg || 
                      'Payment submission failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getInstallmentAmounts = () => {
    if (!service) return { firstInstallment: 0, remainingAmount: 0 };
    
    if (installmentDetails && installmentDetails.length > 0) {
      const firstInstallment = (service.price * (installmentDetails[0].percentage || 30)) / 100;
      const remainingAmount = service.price - firstInstallment;
      
      return { 
        firstInstallment: Math.round(firstInstallment),
        remainingAmount: Math.round(remainingAmount) 
      };
    }
    
    // Default 30/70 split
    const firstInstallment = service.price * 0.3;
    const remainingAmount = service.price * 0.7;
    
    return { 
      firstInstallment: Math.round(firstInstallment),
      remainingAmount: Math.round(remainingAmount) 
    };
  };

  if (!service || checkingInstallment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading payment details...</p>
      </div>
    );
  }

  const { firstInstallment, remainingAmount } = getInstallmentAmounts();

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
            Back
          </button>
          <h1 className="text-3xl font-bold gradient-text">Complete Payment</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={checkUserInstallmentStatus}
              disabled={checkingInstallment}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Refresh installment status"
            >
              <FiRefreshCw className={`mr-1 ${checkingInstallment ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {/* <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-300">
              Debug Info (Click to expand)
            </summary>
            <div className="mt-2 text-xs space-y-1">
              <p><strong>Service ID:</strong> {serviceId}</p>
              <p><strong>Payment Type:</strong> {paymentType}</p>
              <p><strong>Installment Enabled:</strong> {userInstallmentEnabled ? 'Yes' : 'No'}</p>
              <p><strong>Installment Details:</strong> {installmentDetails ? JSON.stringify(installmentDetails) : 'None'}</p>
              <p><strong>Transaction ID:</strong> {transactionId || 'Not entered'}</p>
            </div>
          </details>
        </div> */}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Options */}
          <div className="space-y-6">
            {/* Service Details */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Service Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Service</span>
                  <span className="font-semibold">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Duration</span>
                  <span>{service.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
                  <span className="text-2xl font-bold gradient-text">₹{service.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Type Selection */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Choose Payment Option</h2>
              <div className="space-y-4">
                {/* Full Payment */}
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentType === 'full'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                  onClick={() => setPaymentType('full')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        paymentType === 'full'
                          ? 'gradient-bg text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        <FiDollarSign />
                      </div>
                      <div>
                        <h3 className="font-bold">Pay Full Amount</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          One-time payment
                        </p>
                      </div>
                    </div>
                    {paymentType === 'full' && (
                      <FiCheckCircle className="text-green-500 text-xl" />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-2xl font-bold">₹{service.price}</span>
                  </div>
                </div>

                {/* Installment Payment - Only show if enabled */}
                {userInstallmentEnabled ? (
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentType === 'installment'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                    onClick={() => setPaymentType('installment')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-4 ${
                          paymentType === 'installment'
                            ? 'gradient-bg text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          <FiPercent />
                        </div>
                        <div>
                          <h3 className="font-bold">Pay in Installments</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Pay in multiple installments
                          </p>
                        </div>
                      </div>
                      {paymentType === 'installment' && (
                        <FiCheckCircle className="text-green-500 text-xl" />
                      )}
                    </div>
                    
                    {paymentType === 'installment' && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                              <span className="font-bold">1</span>
                            </div>
                            <span>First Installment</span>
                          </div>
                          <span className="font-bold">₹{firstInstallment}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                              <span className="font-bold">2</span>
                            </div>
                            <span>Remaining Amount</span>
                          </div>
                          <span className="font-bold">₹{remainingAmount}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          <FiAlertCircle className="inline mr-1" />
                          Pay remaining amount before service ends
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg mr-4 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <FiPercent />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-500">Installment Payment</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Installment payments are not enabled for your account
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Contact admin to enable installment payments
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            {paymentType === 'installment' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <FiAlertCircle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Important Notice</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      If you fail to pay the remaining amount before the service period ends, 
                      your account will be marked as suspicious. Make sure to complete all payments on time.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Interface */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="card p-6 text-center">
              <h2 className="text-xl font-bold mb-4">
                {paymentType === 'full' 
                  ? 'Scan to Pay Full Amount' 
                  : `Scan to Pay ${paymentType === 'installment' ? 'First Installment' : 'Amount'}`}
              </h2>
              {qrCode ? (
                <div className="mb-4">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Amount: ₹{paymentType === 'full' 
                      ? service.price 
                      : firstInstallment}
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
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  You can find this in your payment app's transaction history
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || !transactionId.trim()}
                  className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FiRefreshCw className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : paymentType === 'installment' ? 'Submit First Installment' : 'Submit Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/services/${serviceId}`)}
                  className="btn-secondary w-full py-3"
                  disabled={loading}
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

export default PaymentWithInstallment;