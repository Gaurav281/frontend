// frontend/src/pages/admin/AdminBroadcast.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { 
  FiMessageSquare, FiPlus, FiEdit, FiTrash2, 
  FiBell, FiCalendar, FiCheckCircle, FiX,
  FiSave, FiEye, FiEyeOff, FiClock
} from 'react-icons/fi'

const AdminBroadcast = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    message: '',
    isActive: true,
    priority: 'medium'
  })

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/broadcast/admin/broadcast')
      setMessages(data.messages)
    } catch (error) {
      toast.error('Failed to load broadcast messages')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = (message) => {
    setEditingId(message._id)
    setFormData({
      message: message.message,
      isActive: message.isActive,
      priority: message.priority || 'medium'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      await api.delete(`/broadcast/admin/broadcast/${id}`)
      toast.success('Message deleted successfully')
      fetchMessages()
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const toggleMessageStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/broadcast/admin/broadcast/${id}/status`, {
        isActive: !currentStatus
      })
      toast.success(`Message ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchMessages()
    } catch (error) {
      toast.error('Failed to update message status')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await api.put(`/broadcast/admin/broadcast/${editingId}`, formData)
        toast.success('Message updated successfully')
      } else {
        await api.post('/broadcast/admin/broadcast', formData)
        toast.success('Message created successfully')
      }
      
      setShowForm(false)
      setEditingId(null)
      setFormData({
        message: '',
        isActive: true,
        priority: 'medium'
      })
      fetchMessages()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
    
    const labels = {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[priority] || styles.medium}`}>
        <FiBell className="mr-1" />
        {labels[priority] || labels.medium}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}>
        {isActive ? <FiEye className="mr-1" /> : <FiEyeOff className="mr-1" />}
        {isActive ? 'Visible' : 'Hidden'}
      </span>
    )
  }

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Broadcast Messages</h1>
            <p className="text-gray-600 dark:text-gray-300">Send announcements to all users on the homepage</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({
                message: '',
                isActive: true,
                priority: 'medium'
              })
              setShowForm(true)
            }}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            New Message
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Messages</p>
                <p className="text-2xl font-bold mt-1">{messages.length}</p>
              </div>
              <div className="p-3 gradient-bg rounded-lg">
                <FiMessageSquare className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Messages</p>
                <p className="text-2xl font-bold mt-1">
                  {messages.filter(m => m.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <FiEye className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">High Priority</p>
                <p className="text-2xl font-bold mt-1">
                  {messages.filter(m => m.priority === 'high').length}
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <FiBell className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Message Preview */}
        {messages.filter(m => m.isActive).length > 0 && (
          <div className="gradient-bg rounded-2xl p-6 text-white">
            <div className="flex items-center mb-4">
              <FiBell className="mr-3 text-xl" />
              <h2 className="text-xl font-bold">Active Message Preview</h2>
            </div>
            <div className="space-y-4">
              {messages
                .filter(m => m.isActive)
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 }
                  return priorityOrder[b.priority] - priorityOrder[a.priority]
                })
                .map((message) => (
                  <div key={message._id} className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{message.priority.toUpperCase()} PRIORITY</span>
                      <span className="text-sm opacity-80">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-lg">{message.message}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">All Messages</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your first broadcast message to announce updates to users
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => (
                    <tr key={message._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium line-clamp-2">{message.message}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(message.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(message.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-gray-400" />
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(message)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => toggleMessageStatus(message._id, message.isActive)}
                            className={`p-2 rounded-lg ${
                              message.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                            }`}
                            title={message.isActive ? 'Hide' : 'Show'}
                          >
                            {message.isActive ? <FiEyeOff /> : <FiEye />}
                          </button>
                          <button
                            onClick={() => handleDelete(message._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                            title="Delete"
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

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingId ? 'Edit Message' : 'New Broadcast Message'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Enter your announcement message..."
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This message will appear on the homepage for all users
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibility
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Visible</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isActive"
                          checked={!formData.isActive}
                          onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Hidden</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Preview</h3>
                  <div className={`p-4 rounded ${
                    formData.priority === 'high' 
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : formData.priority === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    <div className="flex items-center mb-2">
                      <FiBell className="mr-2" />
                      <span className="font-medium">
                        {formData.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p>{formData.message || 'Your message will appear here...'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center px-6"
                  >
                    <FiSave className="mr-2" />
                    {editingId ? 'Update Message' : 'Create Message'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AdminBroadcast