// frontend/src/pages/admin/AdminPayments.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  FiSearch, FiFilter, FiCheckCircle, FiXCircle,
  FiClock, FiDollarSign, FiCalendar, FiUser,
  FiPackage, FiCreditCard, FiMail, FiEye, FiPercent
} from 'react-icons/fi'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [dateModal, setDateModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [installmentApprovalModal, setInstallmentApprovalModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [installmentNotes, setInstallmentNotes] = useState('');

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [searchTerm, statusFilter, payments])

  // Add function to open date modal
  const openDateModal = (payment) => {
    setEditingPayment(payment);
    setStartDate(payment.startDate ? new Date(payment.startDate) : new Date());
    setEndDate(payment.endDate ? new Date(payment.endDate) : new Date());
    setDateModal(true);
  };

  // Add function to open installment approval modal
  const openInstallmentApproval = (payment, installmentNumber) => {
    const installment = payment.installments.find(
      inst => inst.installmentNumber === installmentNumber
    );

    if (installment) {
      setSelectedPayment(payment);
      setSelectedInstallment(installment);
      setInstallmentApprovalModal(true);
    }
  };

  // Add function to approve/reject installment
  const handleInstallmentStatus = async (status) => {
    try {
      const response = await api.patch(`/admin/payments/${selectedPayment._id}/status`, {
        status,
        installmentNumber: selectedInstallment.installmentNumber,
        notes: installmentNotes
      });

      if (response.data.success) {
        toast.success(`Installment ${selectedInstallment.installmentNumber} ${status}`);
        setInstallmentApprovalModal(false);
        setInstallmentNotes('');
        fetchPayments();

        // Update selected payment if viewing it
        if (selectedPayment?._id === response.data.payment?._id) {
          setSelectedPayment(response.data.payment);
        }
      }
    } catch (error) {
      toast.error('Failed to update installment status');
    }
  };

  // Add function to save dates
  const saveServiceDates = async () => {
    try {
      const response = await api.patch(`/admin/payments/${editingPayment._id}/dates`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (response.data.success) {
        toast.success('Service dates updated successfully');
        setDateModal(false);
        fetchPayments();

        // Update selected payment if it's the same
        if (selectedPayment?._id === editingPayment._id) {
          setSelectedPayment(response.data.payment);
        }
      }
    } catch (error) {
      toast.error('Failed to update service dates');
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/admin/payments')
      setPayments(data.payments)
      setFilteredPayments(data.payments)
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };


  const filterPayments = () => {
    let filtered = payments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentStatus === statusFilter)
    }

    setFilteredPayments(filtered)
  }

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      // Use the correct endpoint: /admin/payments/:id/status
      await api.patch(`/admin/payments/${paymentId}/status`, { status });
      toast.success(`Payment ${status} successfully`);

      // Send email notification
      await api.post(`/admin/payments/${paymentId}/notify`, { status });

      fetchPayments();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }

    const icons = {
      approved: <FiCheckCircle className="mr-1" />,
      pending: <FiClock className="mr-1" />,
      rejected: <FiXCircle className="mr-1" />
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    )
  }

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment)
  }

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Payment Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Approve, reject, and manage all payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Payments</p>
                <p className="text-2xl font-bold mt-1">{payments.length}</p>
              </div>
              <div className="p-3 gradient-bg rounded-lg">
                <FiCreditCard className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold mt-1">
                  {payments.filter(p => p.paymentStatus === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-lg">
                <FiClock className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
                <p className="text-2xl font-bold mt-1">
                  {payments.filter(p => p.paymentStatus === 'approved').length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <FiCheckCircle className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  ${payments
                    .filter(p => p.paymentStatus === 'approved')
                    .reduce((sum, p) => sum + (p.serviceId?.price || 0), 0)
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <FiDollarSign className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, transaction ID, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <FiFilter className="text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === status.value
                      ? 'gradient-bg text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payments Table */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-8 text-center">
                  <FiCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No payments yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User & Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Installments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment._id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedPayment?._id === payment._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{payment.userId?.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {payment.serviceId?.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            <div className="flex items-center">
                              <FiDollarSign className="mr-1" />
                              {payment.serviceId?.price || '0'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {payment.transactionId?.slice(0, 15)}...
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(payment.paymentStatus)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FiCalendar className="mr-2 text-gray-400" />
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => viewPaymentDetails(payment)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                title="View Details"
                              >
                                <FiEye />
                              </button>
                              {/* Approve */}
                              {payment.paymentStatus !== 'approved' && (
                                <button
                                  onClick={() => updatePaymentStatus(payment._id, 'approved')}
                                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                  title="Approve"
                                >
                                  <FiCheckCircle />
                                </button>
                              )}

                              {/* Reject */}
                              {payment.paymentStatus !== 'rejected' && (
                                <button
                                  onClick={() => updatePaymentStatus(payment._id, 'rejected')}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                  title="Reject"
                                >
                                  <FiXCircle />
                                </button>
                              )}

                              {/* Set Pending */}
                              {payment.paymentStatus !== 'pending' && (
                                <button
                                  onClick={() => updatePaymentStatus(payment._id, 'pending')}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg"
                                  title="Set Pending"
                                >
                                  <FiClock />
                                </button>
                              )}

                              <button
                                onClick={() => openDateModal(payment)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                title="Edit Service Dates"
                              >
                                <FiCalendar />
                              </button>

                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {payment.paymentType === 'installment' ? (
                              <div className="space-y-1">
                                {payment.installments?.map((inst, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => openInstallmentApproval(payment, inst.installmentNumber)}
                                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                                  >

                                    <span>#{inst.installmentNumber} ({inst.percentage}%)</span>
                                    <span className={`px-2 py-1 text-xs rounded ${inst.status === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : inst.status === 'submitted'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : inst.status === 'approved'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                      {inst.status === 'paid' ? 'Paid' :
                                        inst.status === 'submitted' ? 'Pending' :
                                          inst.status === 'approved' ? 'Approved' : 'Pending'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">Full</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedPayment ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6 sticky top-24"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCreditCard className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Payment Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Transaction: {selectedPayment.transactionId?.slice(0, 12)}...
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">User</span>
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-400" />
                      <span className="font-medium">{selectedPayment.userId?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Email</span>
                    <div className="flex items-center">
                      <FiMail className="mr-2 text-gray-400" />
                      <span>{selectedPayment.userId?.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Service</span>
                    <div className="flex items-center">
                      <FiPackage className="mr-2 text-gray-400" />
                      <span className="font-medium">{selectedPayment.serviceId?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Amount</span>
                    <div className="flex items-center text-lg font-bold gradient-text">
                      <FiDollarSign />
                      {selectedPayment.serviceId?.price || '0'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Status</span>
                    {getStatusBadge(selectedPayment.paymentStatus)}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-300">Date</span>
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 text-gray-400" />
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Service Dates */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <h4 className="font-bold mb-4">Service Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Start Date</span>
                      <span className="font-medium">
                        {selectedPayment.startDate
                          ? new Date(selectedPayment.startDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">End Date</span>
                      <span className="font-medium">
                        {selectedPayment.endDate
                          ? new Date(selectedPayment.endDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {selectedPayment.paymentStatus !== 'approved' && (
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment._id, 'approved')}
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      Approve Payment
                    </button>
                  )}

                  {selectedPayment.paymentStatus !== 'rejected' && (
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment._id, 'rejected')}
                      className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      <FiXCircle className="inline mr-2" />
                      Reject Payment
                    </button>
                  )}

                  {selectedPayment.paymentStatus !== 'pending' && (
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment._id, 'pending')}
                      className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      <FiClock className="inline mr-2" />
                      Mark as Pending
                    </button>
                  )}

                  {selectedPayment.paymentType === 'installment' && selectedPayment.installments && (
                    <button
                      onClick={() => {
                        // Show installment management modal
                        setSelectedPayment(selectedPayment);
                        // You can create a separate modal for managing installments
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                      title="Manage Installments"
                    >
                      <FiPercent />
                    </button>
                  )}
                </div>


                {/* Email Notification */}
                <button className="w-full btn-secondary mt-4 py-3">
                  <FiMail className="inline mr-2" />
                  Send Email Update
                </button>
              </motion.div>
            ) : (
              <div className="card p-8 text-center">
                <FiEye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Payment</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on the eye icon to view payment details
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {dateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Edit Service Dates</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Set start and end dates for {editingPayment?.serviceId?.name}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  className="input-field w-full"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  className="input-field w-full"
                  dateFormat="yyyy-MM-dd"
                  minDate={startDate}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveServiceDates}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Save Dates
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {installmentApprovalModal && selectedPayment && selectedInstallment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">
              Manage Installment {selectedInstallment.installmentNumber}
            </h3>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Amount</p>
                  <p className="font-bold">{formatCurrency(selectedInstallment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Percentage</p>
                  <p className="font-bold">{selectedInstallment.percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                  <p className="font-bold capitalize">{selectedInstallment.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Due Date</p>
                  <p className="font-bold">{formatDate(selectedInstallment.dueDate)}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={installmentNotes}
                  onChange={(e) => setInstallmentNotes(e.target.value)}
                  className="input-field w-full h-20"
                  placeholder="Add notes about this installment..."
                />
              </div>

              {selectedInstallment.transactionId && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-sm font-medium">Transaction ID:</p>
                  <code className="text-sm">{selectedInstallment.transactionId}</code>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {selectedInstallment.status === 'submitted' && (
                <>
                  <button
                    onClick={() => handleInstallmentStatus('approved')}
                    className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                  >
                    Approve Installment
                  </button>
                  <button
                    onClick={() => handleInstallmentStatus('rejected')}
                    className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                  >
                    Reject Installment
                  </button>
                </>
              )}

              {selectedInstallment.status === 'approved' && (
                <button
                  onClick={() => handleInstallmentStatus('paid')}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                >
                  Mark as Paid
                </button>
              )}

              <button
                onClick={() => {
                  setInstallmentApprovalModal(false);
                  setInstallmentNotes('');
                }}
                className="w-full py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>


  )
}

export default AdminPayments