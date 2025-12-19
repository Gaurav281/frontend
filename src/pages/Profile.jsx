import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiLock, FiLink, FiPlus, FiTrash2,
  FiSave, FiEdit, FiX, FiGlobe, FiFacebook, FiTwitter,
  FiInstagram, FiLinkedin, FiYoutube, FiKey,
  FiRefreshCw, FiDatabase, FiAlertCircle
} from 'react-icons/fi';

const Profile = () => {
  const { user: authUser, updateProfile, changePassword } = useAuth();
  const [profileUser, setProfileUser] = useState(null); // Separate state for profile data
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [socialMedia, setSocialMedia] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('');

  // Fetch profile data directly from profile endpoint
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/user/profile');

      if (data.success && data.user) {

        setProfileUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || ''
        });
        setSocialMedia(Array.isArray(data.user.socialMedia) ? data.user.socialMedia : []);
        setDataSource('/user/profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      // Fallback to auth user data
      if (authUser) {
        setProfileUser(authUser);
        setFormData({
          name: authUser.name || '',
          email: authUser.email || ''
        });
        setSocialMedia(Array.isArray(authUser.socialMedia) ? authUser.socialMedia : []);
        setDataSource('/auth/me (fallback)');
      }
    } finally {
      setLoading(false);
    }
  };

  // Also fetch from auth/me endpoint for comparison
  const fetchAuthData = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        // Just for comparison/debugging
        // console.log('Auth/me data:', data.user);
      }
    } catch (error) {
      console.error('Failed to fetch auth data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // When auth user changes, refetch profile data
  useEffect(() => {
    if (authUser) {
      fetchProfileData();
      fetchAuthData();
    }
  }, [authUser]);

  const platformIcons = {
    facebook: <FiFacebook />,
    twitter: <FiTwitter />,
    instagram: <FiInstagram />,
    linkedin: <FiLinkedin />,
    youtube: <FiYoutube />,
    tiktok: <FiGlobe />,
    other: <FiGlobe />
  };

  const platformOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'other', label: 'Other' }
  ];

  const addSocialMedia = () => {
    setSocialMedia([...socialMedia, { platform: 'facebook', url: '' }]);
  };

  const updateSocialMedia = (index, field, value) => {
    const updated = [...socialMedia];
    if (!updated[index]) {
      updated[index] = { platform: 'facebook', url: '' };
    }
    updated[index][field] = value;
    setSocialMedia(updated);
  };

  const removeSocialMedia = (index) => {
    const updated = [...socialMedia];
    updated.splice(index, 1);
    setSocialMedia(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty social media entries
      const validSocialMedia = socialMedia
        .filter(sm => sm && sm.url && sm.url.trim() !== '')
        .map(sm => ({
          platform: sm.platform || 'other',
          url: sm.url.trim().startsWith('http') ? sm.url.trim() : `https://${sm.url.trim()}`
        }));

      const result = await updateProfile({
        name: formData.name.trim(),
        socialMedia: validSocialMedia
      });

      if (result.success) {
        toast.success('Profile updated successfully');
        setEditMode(false);

        // Refresh all data
        await Promise.all([
          fetchProfileData(),
          fetchAuthData()
        ]);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        toast.success('Password changed successfully');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchProfileData(),
        fetchAuthData()
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Force refresh error:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !profileUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  // Use profileUser as primary source, fallback to authUser
  const displayUser = profileUser || authUser;

  if (!displayUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300">Unable to load user profile</p>
        <button
          onClick={handleForceRefresh}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Try Again
        </button>
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
          <div>
            <h1 className="text-3xl font-bold gradient-text">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account information and social media links
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                Data source: {dataSource}
              </span>
              <button
                onClick={handleForceRefresh}
                disabled={refreshing}
                className="flex items-center text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Refresh all data"
              >
                <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
          {!editMode && !showChangePassword && (
            <button
              onClick={() => setEditMode(true)}
              className="btn-primary flex items-center"
            >
              <FiEdit className="mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Data Source Comparison */}
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <FiDatabase className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">Data Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Is Suspicious:</span>
                  <span className={`ml-2 font-bold ${displayUser.isSuspicious ? 'text-red-600' : 'text-green-600'}`}>
                    {displayUser.isSuspicious ? 'YES' : 'NO'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Installments:</span>
                  <span className={`ml-2 font-bold ${displayUser.installmentSettings?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {displayUser.installmentSettings?.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Social Media:</span>
                  <span className="ml-2 font-bold">
                    {(displayUser.socialMedia?.length || 0)} links
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Account Status:</span>
                  <span className={`ml-2 font-bold ${displayUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {displayUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        {showChangePassword ? (
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Enter new password"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Confirm new password"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Profile Form */
          <div className="card p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Basic Information</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field pl-10"
                        disabled={!editMode}
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
                        value={formData.email}
                        className="input-field pl-10 bg-gray-100 dark:bg-gray-700"
                        disabled
                        readOnly
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowChangePassword(true)}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <FiKey className="mr-2" />
                    Change Password
                  </button>
                </div>

                {/* Right Column - Social Media */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Social Media Links</h2>
                    {editMode && (
                      <button
                        type="button"
                        onClick={addSocialMedia}
                        className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        <FiPlus className="mr-1" />
                        Add Link
                      </button>
                    )}
                  </div>

                  {socialMedia.length === 0 && !editMode ? (
                    <div className="text-center py-8">
                      <FiLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">
                        No social media links added
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {socialMedia.map((link, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-1 flex items-center space-x-4">
                            <div className="w-15">
                              {editMode ? (
                                <select
                                  value={link.platform || 'facebook'}
                                  onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                                  className="input-field text-sm"
                                  disabled={!editMode}
                                >
                                  {platformOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                  <span className="text-xl">
                                    {platformIcons[link.platform] || <FiGlobe />}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <input
                                type="url"
                                value={link.url || ''}
                                onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                                className="input-field"
                                placeholder="https://example.com/profile"
                                disabled={!editMode}
                              />
                            </div>
                          </div>

                          {editMode && (
                            <button
                              type="button"
                              onClick={() => removeSocialMedia(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add links to your social media profiles (optional)
                  </p>
                </div>
              </div>

              {/* Edit Mode Actions */}
              {editMode && (
                <div className="flex items-center justify-end space-x-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      // Reset to original user data
                      if (displayUser) {
                        const originalSocialMedia = Array.isArray(displayUser.socialMedia)
                          ? displayUser.socialMedia.filter(sm => sm && sm.url && sm.url.trim() !== '')
                          : [];
                        setSocialMedia(originalSocialMedia);
                        setFormData({
                          name: displayUser.name || '',
                          email: displayUser.email || ''
                        });
                      }
                    }}
                    className="btn-secondary flex items-center"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center"
                  >
                    <FiSave className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Account Status */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Account Status</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Verification</span>
                <span className={`px-2 py-1 rounded text-xs ${displayUser.isVerified !== false
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                  {displayUser.isVerified !== false ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayUser.isVerified !== false
                  ? 'Your email is verified'
                  : 'Please verify your email address'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Account Status</span>
                <span className={`px-2 py-1 rounded text-xs ${displayUser.isActive !== false && displayUser.isVerified !== false
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                  {displayUser.isActive !== false && displayUser.isVerified !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayUser.isVerified === false
                  ? 'Please verify your email'
                  : displayUser.isActive === false
                    ? 'Your account has been deactivated'
                    : 'Your account is active and verified'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Suspicious Status</span>
                <span className={`px-2 py-1 rounded text-xs ${displayUser.isSuspicious === true
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                  {displayUser.isSuspicious === true ? '⚠️ Suspicious' : 'Normal'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayUser.isSuspicious === true
                  ? 'Your account has been flagged for review. Please contact support.'
                  : 'Your account is in good standing'}
              </p>
            </div>
          </div>
        </div>

        {/* Installment Status */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Installment Settings</h2>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Installment Payments</span>
              <span className={`px-2 py-1 rounded text-xs ${displayUser.installmentSettings?.enabled === true
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                {displayUser.installmentSettings?.enabled === true ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayUser.installmentSettings?.enabled === true
                ? 'You can pay for services in installments.'
                : 'Installment payments are not enabled for your account. Contact admin to enable.'}
            </p>

            {displayUser.installmentSettings?.enabled === true && (
              <div className="mt-3 space-y-2">
                {displayUser.installmentSettings?.defaultSplits && displayUser.installmentSettings.defaultSplits.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Default splits: {displayUser.installmentSettings.defaultSplits.join('/')}%
                  </p>
                )}
                {displayUser.installmentSettings?.splits && displayUser.installmentSettings.splits.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Installment schedule:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {displayUser.installmentSettings.splits.map((split, index) => (
                        <li key={index}>
                          Split {index + 1}: {split.percentage}% (Due in {split.dueDays} days)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        {/* <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-300">
              Debug Info (Click to expand)
            </summary>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>User ID:</strong> {displayUser._id}
                </div>
                <div>
                  <strong>Data Source:</strong> {dataSource}
                </div>
                <div>
                  <strong>isSuspicious:</strong> 
                  <span className={`ml-1 ${displayUser.isSuspicious ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                    {displayUser.isSuspicious?.toString()}
                  </span>
                </div>
                <div>
                  <strong>installmentEnabled:</strong> 
                  <span className={`ml-1 ${displayUser.installmentSettings?.enabled ? 'text-green-600 font-bold' : 'text-red-600'}`}>
                    {displayUser.installmentSettings?.enabled?.toString()}
                  </span>
                </div>
                <div>
                  <strong>Social Media Count:</strong> {displayUser.socialMedia?.length || 0}
                </div>
                <div>
                  <strong>Last Updated:</strong> {displayUser.updatedAt ? new Date(displayUser.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    // Test both endpoints
                    const [profileRes, authRes] = await Promise.all([
                      api.get('/user/profile'),
                      api.get('/auth/me')
                    ]);
                    
                    // console.log('Profile endpoint:', profileRes.data);
                    // console.log('Auth endpoint:', authRes.data);
                    
                    toast.success('Endpoints tested - check console');
                  } catch (error) {
                    console.error('Test error:', error);
                    toast.error('Test failed');
                  }
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Test Endpoints
              </button>
            </div>
          </details>
        </div> */}

        {/* Danger Zone */}
        <div className="card p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">Delete Account</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  toast.error('Account deletion feature coming soon!');
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;