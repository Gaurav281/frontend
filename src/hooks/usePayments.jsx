// frontend/src/hooks/usePayments.jsx
import { useState } from 'react';
import { paymentsAPI } from '../utils/api';

const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we're sending the correct structure
      const cleanPaymentData = {
        serviceId: paymentData.serviceId, // Should be a string
        transactionId: paymentData.transactionId?.trim(),
        paymentType: paymentData.paymentType || 'full'
      };
      
      
      const response = await paymentsAPI.create(cleanPaymentData);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Payment creation error:', err.response?.data || err);
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.[0]?.msg || 
                      'Failed to create payment';
      setError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        details: err.response?.data 
      };
    } finally {
      setLoading(false);
    }
  };

  const getUserPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentsAPI.getAll();
      setPayments(response.data.payments || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch payments';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getPaymentById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentsAPI.getById(id);
      setPayment(response.data.payment);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch payment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (serviceId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentsAPI.getQR(serviceId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate QR code';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentsAPI.updateStatus(id, status);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update payment status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    payment,
    loading,
    error,
    createPayment,
    getUserPayments,
    getPaymentById,
    generateQRCode,
    updatePaymentStatus,
    refetchPayments: getUserPayments
  };
};

export default usePayments;