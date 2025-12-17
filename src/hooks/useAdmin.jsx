// frontend/src/hooks/useAdmin.jsx
import { useState } from 'react';
import { adminAPI, servicesAPI, broadcastAPI, paymentsAPI } from '../utils/api';

const useAdmin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dashboard Stats
  const getDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch dashboard stats';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // User Management
  const getUsers = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUser(id);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch user';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.updateUserRole(id, role);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update user role';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.toggleUserStatus(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to toggle user status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Service Management
  const getServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.getAllAdmin();
      setServices(response.data.services || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch services';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.create(serviceData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create service';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.update(id, serviceData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update service';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.delete(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete service';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.toggleStatus(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to toggle service status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Payment Management
  const getPayments = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getPayments(params);
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

  const sendPaymentNotification = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.sendPaymentNotification(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send notification';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Broadcast Management
  const getBroadcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await broadcastAPI.getAll();
      setBroadcasts(response.data.messages || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch broadcasts';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createBroadcast = async (broadcastData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await broadcastAPI.create(broadcastData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create broadcast';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateBroadcast = async (id, broadcastData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await broadcastAPI.update(id, broadcastData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update broadcast';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteBroadcast = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await broadcastAPI.delete(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete broadcast';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const toggleBroadcastStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await broadcastAPI.toggleStatus(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to toggle broadcast status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    stats,
    users,
    user,
    services,
    payments,
    broadcasts,
    loading,
    error,
    
    // Methods
    getDashboardStats,
    
    // User methods
    getUsers,
    getUser,
    updateUserRole,
    toggleUserStatus,
    
    // Service methods
    getServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    
    // Payment methods
    getPayments,
    sendPaymentNotification,
    
    // Broadcast methods
    getBroadcasts,
    createBroadcast,
    updateBroadcast,
    deleteBroadcast,
    toggleBroadcastStatus,
    
    // Refetch methods
    refetchUsers: () => getUsers(),
    refetchServices: () => getServices(),
    refetchPayments: () => getPayments(),
    refetchBroadcasts: () => getBroadcasts()
  };
};

export default useAdmin;