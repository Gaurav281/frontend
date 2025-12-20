// frontend/src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }

  // Add to useAuth.jsx
  const formatUserData = (userData) => {
    if (!userData) return null;

    // Ensure all fields have proper defaults
    return {
      ...userData,
      authProvider: userData.authProvider,
      isVerified: userData.isVerified !== false,
      isActive: userData.isActive !== false,
      isSuspicious: userData.isSuspicious === true, // Strict comparison
      installmentSettings: {
        enabled: userData.installmentSettings?.enabled === true, // Strict comparison
        splits: Array.isArray(userData.installmentSettings?.splits)
          ? userData.installmentSettings.splits
          : [],
        defaultSplits: Array.isArray(userData.installmentSettings?.defaultSplits)
          ? userData.installmentSettings.defaultSplits
          : [30, 70],
        updatedBy: userData.installmentSettings?.updatedBy,
        updatedAt: userData.installmentSettings?.updatedAt
      },
      socialMedia: Array.isArray(userData.socialMedia)
        ? userData.socialMedia.filter(sm => sm && sm.url && sm.url.trim() !== '')
        : []
    };
  };

  // Update the checkAuth function
  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set auth token first
      setAuthToken(token);

      // Get user data
      const { data } = await api.get('/auth/me');

      if (data.success && data.user) {
        const formattedUser = formatUserData(data.user);
        setUser(formattedUser);
        setError(null);

        // Debug log
        // console.log('Formatted user data:', {
        //   original: data.user,
        //   formatted: formattedUser,
        //   isSuspicious: data.user.isSuspicious,
        //   installmentEnabled: data.user.installmentSettings?.enabled,
        //   strictComparison: data.user.installmentSettings?.enabled === true
        // });

        // Update localStorage with fresh token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
          setAuthToken(data.token);
        }
      } else {
        // Invalid token or user not found
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to useAuth.jsx
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setAuthToken(token);
      const { data } = await api.get('/auth/me');

      if (data.success && data.user) {
        const formattedUser = formatUserData(data.user);
        setUser(formattedUser);

      }
    } catch (err) {
      console.error('Refresh user data failed:', err);
    }
  };

  // Add this function to your AuthContext in useAuth.jsx
  const googleAuth = async (credential) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/google', { credential });

      if (data.success && data.user) {
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);

        // Format user data consistently
        const formattedUser = formatUserData(data.user);
        setUser(formattedUser);

        setError(null);
        toast.success('Google authentication successful!');
        return { success: true, data };
      } else {
        setError(data.message || 'Google authentication failed');
        toast.error(data.message || 'Google authentication failed');
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Google authentication failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        setUser(formatUserData(data.user));
        setError(null);
        toast.success('Login successful!');
        return { success: true, data };
      } else {
        setError(data.message || 'Login failed');
        toast.error(data.message || 'Login failed');
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', userData);

      if (data.success) {
        setError(null);
        return { success: true, data };
      } else {
        setError(data.message || 'Signup failed');
        toast.error(data.message || 'Signup failed');
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Signup failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      if (data.success) {
        toast.success('OTP sent successfully!');
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/verify-otp', { email, otp });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        setUser(formatUserData(data.user));
        setError(null);
        toast.success('Account verified successfully!');
        return { success: true, data };
      } else {
        setError(data.message || 'OTP verification failed');
        toast.error(data.message || 'OTP verification failed');
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'OTP verification failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/user/profile', profileData);
      if (data.success) {
        setUser(prev => ({ ...prev, ...data.user }));
        toast.success('Profile updated successfully!');
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/user/change-password', {
        currentPassword,
        newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to change password';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        toast.success('Password reset successful!');
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success('Reset email sent successfully!');
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    sendOTP,
    verifyOTP,
    logout,
    updateProfile,
    changePassword,
    googleAuth,
    resetPassword,
    forgotPassword,
    checkAuth,
    refreshUserData,
    isAuthenticated: !!user,
    isVerified: user?.isVerified,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};