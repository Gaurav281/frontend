import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  FiSearch, FiFilter, FiEye, FiUserCheck,
  FiUserX, FiMail, FiCalendar, FiPackage,
  FiCreditCard, FiTrendingUp, FiTrash2,
  FiPercent, FiSettings, FiCheck, FiX
} from 'react-icons/fi'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [installmentModal, setInstallmentModal] = useState(false)
  const [splitsModal, setSplitsModal] = useState(false)
  const [installmentSplits, setInstallmentSplits] = useState([30, 70])
  const [newSplit, setNewSplit] = useState('')
  const [forceRefresh, setForceRefresh] = useState(0);


  useEffect(() => {
    fetchUsers();
  }, [forceRefresh]);

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');

      // Format users properly
      const formattedUsers = data.users?.map(user => ({
        ...user,
        isSuspicious: user.isSuspicious === true,
        installmentSettings: {
          enabled: user.installmentSettings?.enabled === true,
          splits: user.installmentSettings?.splits || [],
          defaultSplits: user.installmentSettings?.defaultSplits || [30, 70],
          updatedBy: user.installmentSettings?.updatedBy,
          updatedAt: user.installmentSettings?.updatedAt
        }
      })) || [];

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);

    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }

  const viewUserDetails = async (userId) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`)
      setUserDetails(data.user)
      setSelectedUser(userId)
    } catch (error) {
      toast.error('Failed to load user details')
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const toggleSuspicionStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;

      const response = await api.patch(`/admin/users/${userId}/suspicion`, {
        isSuspicious: newStatus
      });

      if (response.data.success) {
        toast.success(`User marked as ${newStatus ? 'suspicious' : 'not suspicious'}`);

        // Update local state immediately
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, isSuspicious: newStatus }
              : user
          )
        );

        // Update user details if viewing this user
        if (userDetails?._id === userId) {
          setUserDetails(prev => ({
            ...prev,
            isSuspicious: newStatus,
            // If marked suspicious, disable installments
            ...(newStatus && {
              installmentSettings: {
                ...prev.installmentSettings,
                enabled: false
              }
            })
          }));
        }

        // Force refresh after a short delay
        setTimeout(() => {
          fetchUsers();
        }, 500);
      }
    } catch (error) {
      console.error('Toggle suspicion error:', error);
      toast.error(error.response?.data?.message || 'Failed to update suspicion status');
    }
  };

  const toggleInstallmentStatus = async (userId, currentEnabled) => {
    try {
      const newEnabled = !currentEnabled;

      const response = await api.patch(`/admin/users/${userId}/installments`, {
        enabled: newEnabled
      });

      if (response.data.success) {
        toast.success(`Installments ${newEnabled ? 'enabled' : 'disabled'} for user`);

        // Update local state immediately
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? {
                ...user,
                installmentSettings: {
                  ...user.installmentSettings,
                  enabled: newEnabled
                }
              }
              : user
          )
        );

        // Refresh the user details if currently viewing this user
        if (userDetails?._id === userId) {
          setUserDetails(prev => ({
            ...prev,
            installmentSettings: {
              ...prev.installmentSettings,
              enabled: newEnabled
            }
          }));
        }

        // Force refresh after a short delay
        setTimeout(() => {
          fetchUsers();
        }, 500);
      }
    } catch (error) {
      console.error('Toggle installment error:', error);
      toast.error(error.response?.data?.message || 'Failed to update installment settings');
    }
  };

  const openInstallmentModal = (user) => {
    setUserDetails(user)
    setInstallmentSplits(user.installmentSettings?.defaultSplits || [30, 70])
    setInstallmentModal(true)
  }

  const openSplitsModal = (user) => {
    setUserDetails(user)
    setInstallmentSplits(user.installmentSettings?.defaultSplits || [30, 70])
    setSplitsModal(true)
  }

  const handleSetSplits = async () => {
    if (installmentSplits.reduce((a, b) => a + b, 0) !== 100) {
      toast.error('Splits must total 100%');
      return;
    }

    try {

      const response = await api.post(`/admin/users/${userDetails._id}/installments/splits`, {
        splits: installmentSplits
      });

      if (response.data.success) {
        toast.success('Installment splits updated successfully');

        // Update local state
        if (userDetails?._id === response.data.user?._id) {
          setUserDetails(prev => ({
            ...prev,
            installmentSettings: {
              ...prev.installmentSettings,
              splits: response.data.user.installmentSettings?.splits || [],
              defaultSplits: response.data.user.installmentSettings?.defaultSplits || [30, 70]
            }
          }));
        }

        setSplitsModal(false);

        // Force refresh
        setTimeout(() => {
          fetchUsers();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to update splits:', error);
      toast.error(error.response?.data?.message || 'Failed to update splits');
    }
  };

  const addSplit = () => {
    if (newSplit && !isNaN(newSplit)) {
      const splitValue = parseInt(newSplit)
      if (splitValue > 0 && splitValue <= 100) {
        setInstallmentSplits([...installmentSplits, splitValue])
        setNewSplit('')
      }
    }
  }

  const removeSplit = (index) => {
    const newSplits = [...installmentSplits]
    newSplits.splice(index, 1)
    setInstallmentSplits(newSplits)
  }

  const updateSplit = (index, value) => {
    const newSplits = [...installmentSplits]
    newSplits[index] = parseInt(value) || 0
    setInstallmentSplits(newSplits)
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their payments.')) {
      return
    }

    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'blocked' || status === false) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <FiUserX className="mr-1" /> Inactive
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <FiUserCheck className="mr-1" /> Active
      </span>
    )
  }

  const getSuspicionBadge = (isSuspicious) => {
    if (isSuspicious) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          ⚠️ Suspicious
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        ✓ Normal
      </span>
    )
  }

  const getInstallmentBadge = (installmentSettings) => {
    if (installmentSettings?.enabled === true) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <FiPercent className="mr-1" /> Enabled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <FiX className="mr-1" /> Disabled
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[role] || colors.user}`}>
        {role?.charAt(0).toUpperCase() + role?.slice(1)}
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage all registered users and their installment settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-2xl font-bold mt-1">{users.length}</p>
              </div>
              <div className="p-3 gradient-bg rounded-lg">
                <FiUserCheck className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Suspicious Users</p>
                <p className="text-2xl font-bold mt-1">
                  {users.filter(u => u.isSuspicious).length}
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <FiUserX className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Installment Enabled</p>
                <p className="text-2xl font-bold mt-1">
                  {users.filter(u => u.installmentSettings?.enabled).length}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <FiPercent className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Admins</p>
                <p className="text-2xl font-bold mt-1">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <FiUserCheck className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="ml-4 flex items-center">
              <FiFilter className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {filteredUsers.length} users found
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <FiUserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchTerm ? 'Try a different search term' : 'No users registered yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Installments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user._id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedUser === user._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                              <div className="flex items-center mt-1">
                                {getRoleBadge(user.role)}
                                <span className="ml-2">
                                  {getSuspicionBadge(user.isSuspicious)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(user.isActive)}
                          </td>
                          <td className="px-6 py-4">
                            {getInstallmentBadge(user.installmentSettings)}
                            {user.installmentSettings?.enabled && user.installmentSettings?.defaultSplits && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {user.installmentSettings.defaultSplits.join('/')}%
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => viewUserDetails(user._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                title="View Details"
                              >
                                <FiEye />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user._id, user.isActive)}
                                className={`p-2 rounded-lg ${user.isActive
                                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                                  }`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? <FiUserX /> : <FiUserCheck />}
                              </button>
                              <button
                                onClick={() => toggleSuspicionStatus(user._id, user.isSuspicious)}
                                className={`p-2 rounded-lg ${user.isSuspicious
                                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                                  : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                                  }`}
                                title={user.isSuspicious ? 'Mark Normal' : 'Mark Suspicious'}
                              >
                                ⚠️
                              </button>
                              <button
                                onClick={() => openInstallmentModal(user)}
                                className={`p-2 rounded-lg ${user.installmentSettings?.enabled
                                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                                  }`}
                                title={user.installmentSettings?.enabled ? 'Disable Installments' : 'Enable Installments'}
                              >
                                <FiPercent />
                              </button>
                              {user.installmentSettings?.enabled && (
                                <button
                                  onClick={() => openSplitsModal(user)}
                                  className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                                  title="Configure Splits"
                                >
                                  <FiSettings />
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                title="Delete User"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Details Sidebar */}
          <div className="lg:col-span-1">
            {userDetails ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6 sticky top-24"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {userDetails.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{userDetails.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{userDetails.email}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Role</span>
                    {getRoleBadge(userDetails.role)}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Account Status</span>
                    {getStatusBadge(userDetails.isActive)}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Suspicion Status</span>
                    {getSuspicionBadge(userDetails.isSuspicious)}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Installments</span>
                    {getInstallmentBadge(userDetails.installmentSettings)}
                  </div>
                  {userDetails.installmentSettings?.enabled && userDetails.installmentSettings?.defaultSplits && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300">Splits</span>
                      <span className="font-medium">
                        {userDetails.installmentSettings.defaultSplits.join('/')}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-300">Member Since</span>
                    <span>{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Installment Settings Actions */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => toggleInstallmentStatus(userDetails._id, userDetails.installmentSettings?.enabled)}
                    className={`w-full py-3 rounded-lg font-semibold ${userDetails.installmentSettings?.enabled
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                  >
                    {userDetails.installmentSettings?.enabled ? 'Disable Installments' : 'Enable Installments'}
                  </button>

                  {userDetails.installmentSettings?.enabled && (
                    <button
                      onClick={() => openSplitsModal(userDetails)}
                      className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600"
                    >
                      Configure Splits
                    </button>
                  )}

                  <button
                    onClick={() => toggleSuspicionStatus(userDetails._id, userDetails.isSuspicious)}
                    className={`w-full py-3 rounded-lg font-semibold ${userDetails.isSuspicious
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      }`}
                  >
                    {userDetails.isSuspicious ? 'Mark as Normal' : 'Mark as Suspicious'}
                  </button>
                </div>

                {/* User Stats */}
                {userDetails.paymentStats && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-bold mb-4">Payment Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <FiCreditCard className="w-6 h-6 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {userDetails.paymentStats.totalPayments}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Payments</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <FiTrendingUp className="w-6 h-6 text-green-500 mb-2" />
                        <div className="text-2xl font-bold">
                          ${userDetails.paymentStats.totalSpent}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Spent</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <FiPercent className="w-6 h-6 text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {userDetails.paymentStats.installmentPayments}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Installment Payments</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <FiCalendar className="w-6 h-6 text-red-500 mb-2" />
                        <div className="text-2xl font-bold">
                          {userDetails.paymentStats.overdueInstallments}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Overdue</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="card p-8 text-center">
                <FiEye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a User</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on the eye icon to view user details
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Installment Splits Modal */}
      {splitsModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Configure Installment Splits</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Set the percentage splits for {userDetails.name}'s installment payments.
              Total must be 100%.
            </p>

            <div className="space-y-4 mb-6">
              {installmentSplits.map((split, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="font-medium">Split {index + 1}:</span>
                  <input
                    type="number"
                    value={split}
                    onChange={(e) => updateSplit(index, e.target.value)}
                    className="input-field flex-1"
                    min="1"
                    max="100"
                  />
                  <span className="text-gray-600 dark:text-gray-300">%</span>
                  {installmentSplits.length > 2 && (
                    <button
                      onClick={() => removeSplit(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={newSplit}
                  onChange={(e) => setNewSplit(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Add new split %"
                  min="1"
                  max="100"
                />
                <button
                  onClick={addSplit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Total:</span>
                <span className="font-bold">{installmentSplits.reduce((a, b) => a + b, 0)}%</span>
              </div>
              {installmentSplits.reduce((a, b) => a + b, 0) !== 100 && (
                <p className="text-red-600 text-sm">
                  Splits must total 100%. Current total: {installmentSplits.reduce((a, b) => a + b, 0)}%
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSplitsModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSetSplits}
                disabled={installmentSplits.reduce((a, b) => a + b, 0) !== 100}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Splits
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Installment Enable/Disable Modal */}
      {installmentModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">
              {userDetails.installmentSettings?.enabled ? 'Disable' : 'Enable'} Installments
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {userDetails.installmentSettings?.enabled
                ? `Are you sure you want to disable installment payments for ${userDetails.name}?`
                : `Enable installment payments for ${userDetails.name}. You can configure splits after enabling.`
              }
            </p>

            {!userDetails.installmentSettings?.enabled && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Splits (optional)
                </label>
                <input
                  type="text"
                  value={installmentSplits.join('/')}
                  onChange={(e) => {
                    const splits = e.target.value.split('/').map(s => parseInt(s) || 30);
                    if (splits.length >= 2) {
                      setInstallmentSplits(splits);
                    }
                  }}
                  className="input-field"
                  placeholder="30/70"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter splits separated by / (e.g., 30/70, 40/60, 25/25/25/25)
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setInstallmentModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // First enable/disable installments
                    await api.patch(`/admin/users/${userDetails._id}/installments`, {
                      enabled: !userDetails.installmentSettings?.enabled
                    });

                    // If enabling and splits provided, set them
                    if (!userDetails.installmentSettings?.enabled && installmentSplits.reduce((a, b) => a + b, 0) === 100) {
                      await api.post(`/admin/users/${userDetails._id}/installments/splits`, {
                        splits: installmentSplits
                      });
                    }

                    toast.success(
                      `Installments ${!userDetails.installmentSettings?.enabled ? 'enabled' : 'disabled'} successfully`
                    );
                    setInstallmentModal(false);
                    fetchUsers();
                  } catch (error) {
                    toast.error('Failed to update installment settings');
                  }
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {userDetails.installmentSettings?.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers