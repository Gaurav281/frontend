import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import usePayments from '../hooks/usePayments';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiUser, FiCalendar, FiClock, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiCreditCard, FiPackage,
  FiDollarSign, FiPercent, FiEye, FiDownload,
  FiMessageSquare, FiShare2, FiSettings, FiTrash2,
  FiChevronDown, FiChevronUp, FiInfo, FiExternalLink
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const { payments, getUserPayments, loading } = usePayments();
  const [expandedService, setExpandedService] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});

  useEffect(() => {
    getUserPayments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getServiceStatus = (payment) => {
    if (!payment) return 'pending';

    // Check if service is manually marked as completed
    if (payment.isServiceCompleted) {
      return 'completed';
    }

    // Check payment status
    if (payment.paymentStatus === 'rejected') {
      return 'rejected';
    }

    if (payment.paymentStatus === 'pending') {
      return 'pending';
    }

    // Check service dates
    const now = new Date();

    if (!payment.startDate || !payment.endDate) {
      return payment.paymentStatus === 'approved' ? 'pending' : 'pending';
    }

    const startDate = new Date(payment.startDate);
    const endDate = new Date(payment.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'pending';
    }

    if (now < startDate) {
      return 'pending';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else if (now > endDate) {
      return 'expired';
    }

    return 'pending';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        text: 'Active',
        icon: <FiCheckCircle className="mr-1" />,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      },
      pending: {
        text: 'Pending',
        icon: <FiAlertCircle className="mr-1" />,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      },
      expired: {
        text: 'Expired',
        icon: <FiXCircle className="mr-1" />,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      },
      completed: {
        text: 'Completed',
        icon: <FiCheckCircle className="mr-1" />,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      },
      rejected: {
        text: 'Rejected',
        icon: <FiXCircle className="mr-1" />,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      },
      partial: {
        text: 'Partial',
        icon: <FiPercent className="mr-1" />,
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      }
    };

    const currentStatus = statusMap[status] || statusMap.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.className}`}>
        {currentStatus.icon}
        {currentStatus.text}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const statusMap = {
      approved: {
        text: 'Approved',
        icon: <FiCheckCircle className="mr-1" />,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      },
      pending: {
        text: 'Pending',
        icon: <FiClock className="mr-1" />,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      },
      rejected: {
        text: 'Rejected',
        icon: <FiXCircle className="mr-1" />,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      },
      partial: {
        text: 'Partial',
        icon: <FiPercent className="mr-1" />,
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      }
    };

    const currentStatus = statusMap[status] || statusMap.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.className}`}>
        {currentStatus.icon}
        {currentStatus.text}
      </span>
    );
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      const { data } = await api.get(`/payments/${paymentId}`);
      if (data.success) {
        setPaymentDetails(prev => ({
          ...prev,
          [paymentId]: data.payment
        }));
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
    }
  };

  const toggleServiceDetails = (paymentId) => {
    if (expandedService === paymentId) {
      setExpandedService(null);
    } else {
      setExpandedService(paymentId);
      if (!paymentDetails[paymentId]) {
        fetchPaymentDetails(paymentId);
      }
    }
  };

  const markServiceComplete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to mark this service as completed?')) {
      return;
    }

    try {
      const { data } = await api.patch(`/payments/${paymentId}/complete`);
      if (data.success) {
        toast.success('Service marked as completed');
        getUserPayments(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to mark service as complete');
    }
  };

  const downloadInvoice = async (paymentId) => {
    try {
      // Create a simple invoice HTML
      const payment = payments.find(p => p._id === paymentId);
      if (!payment) return;

      const invoiceContent = `
        <html>
          <head>
            <title>Invoice - ${payment.serviceId?.name || 'Service'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .invoice { border: 1px solid #ccc; padding: 20px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin: 20px 0; }
              .details table { width: 100%; border-collapse: collapse; }
              .details td { padding: 10px; border-bottom: 1px solid #eee; }
              .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="invoice">
              <div class="header">
                <h1>Invoice</h1>
                <p>5StarClip Production</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="details">
                <table>
                  <tr>
                    <td>Service Name:</td>
                    <td>${payment.serviceId?.name || 'Service'}</td>
                  </tr>
                  <tr>
                    <td>Amount:</td>
                    <td>${formatCurrency(payment.amount)}</td>
                  </tr>
                  <tr>
                    <td>Payment Type:</td>
                    <td>${payment.paymentType || 'full'}</td>
                  </tr>
                  <tr>
                    <td>Payment Status:</td>
                    <td>${payment.paymentStatus}</td>
                  </tr>
                  <tr>
                    <td>Transaction ID:</td>
                    <td>${payment.transactionId || 'N/A'}</td>
                  </tr>
                </table>
              </div>
              <div class="total">
                Total Paid: ${formatCurrency(payment.amountPaid || 0)}
              </div>
            </div>
          </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([invoiceContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${paymentId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const contactSupport = (serviceName) => {
    const subject = `Support Request: ${serviceName}`;
    const body = `Hello Support Team,\n\nI need assistance with my service: ${serviceName}\n\nDetails:`;
    window.location.href = `mailto:5starclipp@gmailcom?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareService = (serviceName) => {
    if (navigator.share) {
      navigator.share({
        title: serviceName,
        text: `Check out this service I'm using: ${serviceName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const removeService = async (paymentId) => {
    if (!window.confirm('Are you sure you want to remove this service from your dashboard? This will not cancel the service.')) {
      return;
    }

    try {
      // In a real app, you would call an API to hide/remove the service from user view
      // For now, we'll filter it out from the local state
      // setPayments(prev => prev.filter(p => p._id !== paymentId));
      toast.success('Service removed from dashboard');

    } catch (error) {
      toast.error('Failed to remove service');
    }
  };

  const payPendingInstallment = async (paymentId, installmentNumber) => {
    const transactionId = prompt('Enter transaction ID for installment payment:');
    if (!transactionId) return;

    try {
      const { data } = await api.post(`/payments/${paymentId}/pay-installment`, {
        installmentNumber,
        transactionId
      });

      if (data.success) {
        toast.success(`Installment ${installmentNumber} submitted. Waiting for admin approval.`);
        getUserPayments(); // Refresh the list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit installment');
    }
  };

  // Calculate stats
  const activeServices = payments.filter(p => getServiceStatus(p) === 'active').length;
  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending').length;
  const completedServices = payments.filter(p => getServiceStatus(p) === 'completed' || p.isServiceCompleted).length;
  const totalSpent = payments
    .filter(p => p.paymentStatus === 'approved' || p.paymentStatus === 'partial')
    .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your digital services and track payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Services</p>
                <p className="text-2xl font-bold mt-1">{payments.length}</p>
              </div>
              <div className="p-3 gradient-bg rounded-lg">
                <FiPackage className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Services</p>
                <p className="text-2xl font-bold mt-1">{activeServices}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <FiCheckCircle className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pending Payments</p>
                <p className="text-2xl font-bold mt-1">{pendingPayments}</p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-lg">
                <FiClock className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Spent</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <FiDollarSign className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Your Enrolled Services</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Click on any service to view details and perform actions
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services enrolled yet</h3>
              <p className="text-gray-600 dark:text-gray-300">Explore our services to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => {
                const serviceStatus = getServiceStatus(payment);
                const isExpanded = expandedService === payment._id;
                const details = paymentDetails[payment._id];

                return (
                  <div key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* Service Summary Row */}
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleServiceDetails(payment._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{payment.serviceId?.name || 'Service'}</h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {payment.serviceId?.description?.substring(0, 100) || 'No description available'}...
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(serviceStatus)}
                              {getPaymentBadge(payment.paymentStatus)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div className="flex items-center">
                              <FiDollarSign className="mr-2 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Amount</p>
                                <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <FiClock className="mr-2 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                                <p className="font-semibold">{payment.serviceId?.duration || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <FiCalendar className="mr-2 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Start Date</p>
                                <p className="font-semibold">{formatDate(payment.startDate)}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <FiCalendar className="mr-2 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">End Date</p>
                                <p className="font-semibold">{formatDate(payment.endDate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          {isExpanded ? (
                            <FiChevronUp className="text-gray-400 text-xl" />
                          ) : (
                            <FiChevronDown className="text-gray-400 text-xl" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="mt-6 space-y-6">
                          {/* Payment Summary */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <h4 className="font-bold mb-4 flex items-center">
                              <FiCreditCard className="mr-2" />
                              Payment Summary
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Payment Type</p>
                                <p className="font-semibold capitalize">{payment.paymentType || 'Full'}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Amount Paid</p>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(payment.amountPaid || 0)}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Amount Due</p>
                                <p className="font-semibold text-red-600">
                                  {formatCurrency(payment.amountDue || payment.amount)}
                                </p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {payment.amount > 0 && (
                              <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Payment Progress</span>
                                  <span>{Math.round(((payment.amountPaid || 0) / payment.amount) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${((payment.amountPaid || 0) / payment.amount) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Installment Details */}
                          {payment.paymentType === 'installment' && payment.installments && payment.installments.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                              <h4 className="font-bold mb-4 flex items-center">
                                <FiPercent className="mr-2" />
                                Installment Details
                              </h4>

                              <div className="space-y-4">
                                {payment.installments.map((installment, index) => {
                                  // Determine button text and disabled state
                                  let buttonText = '';
                                  let isDisabled = false;
                                  let buttonColor = '';

                                  switch (installment.status) {
                                    case 'paid':
                                      buttonText = 'Paid';
                                      isDisabled = true;
                                      buttonColor = 'bg-green-500';
                                      break;
                                    case 'approved':
                                      buttonText = 'Approved (Waiting for payment)';
                                      isDisabled = true;
                                      buttonColor = 'bg-blue-500';
                                      break;
                                    case 'submitted':
                                      buttonText = 'Pending Admin Approval';
                                      isDisabled = true;
                                      buttonColor = 'bg-yellow-500';
                                      break;
                                    case 'rejected':
                                      buttonText = 'Rejected - Submit Again';
                                      isDisabled = false;
                                      buttonColor = 'bg-red-500';
                                      break;
                                    default: // 'pending'
                                      // First installment needs admin approval if not submitted yet
                                      if (installment.installmentNumber === 1 && payment.paymentStatus === 'partial') {
                                        buttonText = 'Waiting for Admin Approval';
                                        isDisabled = true;
                                        buttonColor = 'bg-gray-500';
                                      } else {
                                        buttonText = 'Pay Now';
                                        isDisabled = false;
                                        buttonColor = 'bg-primary-500';
                                      }
                                  }

                                  return (
                                    <div
                                      key={index}
                                      className={`p-4 rounded-lg border ${installment.status === 'paid'
                                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                          : installment.status === 'submitted' || installment.status === 'approved'
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                            : installment.status === 'rejected'
                                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${installment.status === 'paid'
                                              ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                                              : installment.status === 'submitted' || installment.status === 'approved'
                                                ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                                                : installment.status === 'rejected'
                                                  ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'
                                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                            }`}>
                                            {installment.installmentNumber}
                                          </div>
                                          <div>
                                            <p className="font-semibold">
                                              Installment {installment.installmentNumber} ({installment.percentage}%)
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                              Due: {formatDate(installment.dueDate)}
                                            </p>
                                            {installment.status === 'submitted' && (
                                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                ⏳ Submitted on: {formatDate(installment.submittedAt)}
                                              </p>
                                            )}
                                            {installment.status === 'approved' && (
                                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                ✅ Approved on: {formatDate(installment.approvedAt)}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <p className="font-bold">{formatCurrency(installment.amount)}</p>
                                          <span className={`text-sm px-2 py-1 rounded ${installment.status === 'paid'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                              : installment.status === 'submitted'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                : installment.status === 'approved'
                                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                  : installment.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                            }`}>
                                            {installment.status === 'paid' ? 'Paid' :
                                              installment.status === 'submitted' ? 'Pending Approval' :
                                                installment.status === 'approved' ? 'Approved' :
                                                  installment.status === 'rejected' ? 'Rejected' : 'Pending'}
                                          </span>
                                        </div>
                                      </div>

                                      {installment.status === 'pending' && !isDisabled && (
                                        <button
                                          onClick={() => payPendingInstallment(payment._id, installment.installmentNumber)}
                                          className="mt-2 w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                        >
                                          Pay Now
                                        </button>
                                      )}

                                      {installment.status === 'rejected' && (
                                        <button
                                          onClick={() => payPendingInstallment(payment._id, installment.installmentNumber)}
                                          className="mt-2 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                          Submit Again
                                        </button>
                                      )}

                                      {installment.status === 'paid' && installment.paidDate && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                          Paid on: {formatDate(installment.paidDate)}
                                        </p>
                                      )}

                                      {installment.status === 'submitted' && installment.submittedAt && (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                                          Submitted on: {formatDate(installment.submittedAt)} - Waiting for admin approval
                                        </p>
                                      )}

                                      {installment.status === 'approved' && installment.approvedAt && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                          Approved on: {formatDate(installment.approvedAt)} - Ready for payment
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Service Features */}
                          {payment.serviceId?.features && payment.serviceId.features.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                              <h4 className="font-bold mb-4">Service Features</h4>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {payment.serviceId.features.map((feature, index) => (
                                  <li key={index} className="flex items-start">
                                    <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <button
                              onClick={() => downloadInvoice(payment._id)}
                              className="flex items-center justify-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              title="Download Invoice"
                            >
                              <FiDownload className="mr-2" />
                              Invoice
                            </button>

                            <button
                              onClick={() => contactSupport(payment.serviceId?.name)}
                              className="flex items-center justify-center p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                              title="Contact Support"
                            >
                              <FiMessageSquare className="mr-2" />
                              Support
                            </button>

                            <button
                              onClick={() => shareService(payment.serviceId?.name)}
                              className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              title="Share Service"
                            >
                              <FiShare2 className="mr-2" />
                              Share
                            </button>

                            {serviceStatus === 'active' && !payment.isServiceCompleted && (
                              <button
                                onClick={() => markServiceComplete(payment._id)}
                                className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                title="Mark as Completed"
                              >
                                <FiCheckCircle className="mr-2" />
                                Complete
                              </button>
                            )}

                            <button
                              onClick={() => removeService(payment._id)}
                              className="flex items-center justify-center p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Remove Service"
                            >
                              <FiTrash2 className="mr-2" />
                              Remove
                            </button>
                          </div>

                          {/* Additional Info */}
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start">
                              <FiInfo className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Need Help?</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                  {payment.paymentType === 'installment'
                                    ? 'Make sure to pay all installments before the due dates to avoid being marked as suspicious.'
                                    : 'If you have any issues with this service, please contact our support team.'
                                  }
                                </p>
                                <button
                                  onClick={() => window.open('/contact', '_blank')}
                                  className="mt-2 text-yellow-600 dark:text-yellow-400 hover:underline flex items-center"
                                >
                                  <FiExternalLink className="mr-1" />
                                  Contact Support Page
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;