import { useState, useEffect } from 'react';
import api from '../utils/api';

const useServices = (filters = {}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      
      const { data } = await api.get(`/services?${params}`);
      setServices(data.services);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters.category, filters.search, filters.sort]);

  const getServiceById = async (id) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/services/${id}`);
      return { success: true, service: data.service };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to fetch service' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getRelatedServices = async (id) => {
    try {
      const { data } = await api.get(`/services/related/${id}`);
      return { success: true, services: data.services };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to fetch related services' 
      };
    }
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    getServiceById,
    getRelatedServices,
    refetch: fetchServices
  };
};

export default useServices;