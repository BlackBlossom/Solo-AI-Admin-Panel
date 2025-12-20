import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, Trash2, Eye, Mail, Calendar, Users as UsersIcon, Search, Filter, TrendingUp, UserCheck, UserX, Video, Image as ImageIcon, HardDrive, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { userService } from '../services/userService';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ 
    page: 1, 
    limit: 20, 
    search: '',
    status: '', // all, active, banned, suspended
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [banData, setBanData] = useState({
    status: 'banned',
    reason: '',
    duration: '',
    isPermanent: false
  });
  const location = useLocation();

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    // Find the scrollable main container and scroll it to top
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Also scroll window as fallback
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.sortBy, filters.sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await userService.getAll(cleanFilters);
      // API returns { status, message, data: { users, pagination } }
      setUsers(response.data?.users || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering (like ActivityLogs)
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleBanUser = async () => {
    if (!banData.reason.trim()) {
      toast.error('Please provide a reason for banning');
      return;
    }

    if (!banData.isPermanent && !banData.duration) {
      toast.error('Please specify ban duration or select permanent ban');
      return;
    }

    try {
      setBanLoading(true);
      const payload = {
        status: banData.status,
        reason: banData.reason
      };

      // Only add duration if not permanent
      if (!banData.isPermanent && banData.duration) {
        payload.duration = parseInt(banData.duration);
      }

      await userService.banUser(selectedUser._id, payload);
      
      const message = banData.isPermanent 
        ? `User ${banData.status === 'banned' ? 'banned' : 'suspended'} permanently`
        : `User ${banData.status === 'banned' ? 'banned' : 'suspended'} for ${banData.duration} days`;
      
      toast.success(message);
      setBanModalOpen(false);
      setBanData({ status: 'banned', reason: '', duration: '', isPermanent: false });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnbanUser = async (id) => {
    try {
      await userService.banUser(id, { status: 'active' });
      toast.success('User reactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reactivate user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      await userService.delete(selectedUser._id);
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: pagination.total || 0,
    active: users.filter(u => u.status === 'active').length,
    banned: users.filter(u => u.status === 'banned').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header with gradient and animated background */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7E29F0] via-[#561E97] to-[#190830]" />
        
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              User Management
            </h1>
          </motion.div>
          <p className="text-purple-100 text-lg">
            Manage and moderate user accounts across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <UsersIcon size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <UserCheck size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.active.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Ban size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Banned Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.banned.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <UserX size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Suspended Users</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.suspended.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Status, Sort By, and Order in single line */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Sort By:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
                className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white text-sm"
              >
                <option value="createdAt">Join Date</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="lastLogin">Last Login</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Order:</label>
              <div className="flex gap-2">
                {[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ ...filters, sortOrder: option.value, page: 1 })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      filters.sortOrder === option.value
                        ? 'bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User count info */}
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid/Table */}
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl shadow-xl p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#7E29F0]/20"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#7E29F0] absolute inset-0"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-[#7E29F0]/10 to-[#561E97]/10 rounded-3xl mb-4">
              <UsersIcon size={64} className="text-[#7E29F0]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {users.length === 0 
                ? 'No users available in the database'
                : 'Try adjusting your search filters'
              }
            </p>
          </motion.div>
        ) : (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  
                  {/* Card */}
                  <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-purple-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=7E29F0&color=fff`}
                            alt={user.name}
                            className="h-16 w-16 rounded-2xl object-cover border-2 border-purple-500/20"
                          />
                          {user.status === 'active' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{user.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {user.status === 'banned' ? (
                        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-red-400/20 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Banned
                        </span>
                      ) : user.status === 'suspended' ? (
                        <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-orange-400/20 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Suspended
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-green-400/20 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      )}
                    </div>

                    {/* Login Type */}
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#7E29F0]/10 to-[#561E97]/10 border border-purple-500/20 rounded-lg text-xs font-medium text-[#7E29F0]">
                        <Shield size={12} />
                        {user.loginType}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200/20 dark:border-blue-700/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Video size={14} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Videos</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{user.videos?.length || 0}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 border border-purple-200/20 dark:border-purple-700/20">
                        <div className="flex items-center gap-2 mb-1">
                          <ImageIcon size={14} className="text-purple-600 dark:text-purple-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Posts</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{user.posts?.length || 0}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200/20 dark:border-green-700/20">
                        <div className="flex items-center gap-2 mb-1">
                          <HardDrive size={14} className="text-green-600 dark:text-green-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Accounts</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{user.socialAccounts?.length || 0}</p>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <Calendar size={12} />
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setDetailsModalOpen(true);
                        }}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                        title="View Details"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      
                      <div className="flex gap-2">
                        {user.status === 'banned' || user.status === 'suspended' ? (
                          <button
                            onClick={() => handleUnbanUser(user._id)}
                            className="flex-1 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                            title="Reactivate User"
                          >
                            <CheckCircle size={16} />
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setBanData({ status: 'banned', reason: '', duration: '', isPermanent: false });
                              setBanModalOpen(true);
                            }}
                            className="flex-1 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:scale-105 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                            title="Ban/Suspend User"
                          >
                            <Ban size={16} />
                            Ban
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteModalOpen(true);
                          }}
                          className="flex-1 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Showing <span className="text-[#7E29F0] font-bold">{users.length}</span> of <span className="text-[#7E29F0] font-bold">{pagination.total?.toLocaleString()}</span> users
                </p>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={(page) => setFilters({ ...filters, page })}
                />
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Ban User Modal */}
      <Modal
        isOpen={banModalOpen}
        onClose={() => {
          setBanModalOpen(false);
          setBanData({ status: 'banned', reason: '', duration: '', isPermanent: false });
        }}
        title={`${banData.status === 'banned' ? 'Ban' : 'Suspend'} User Account`}
      >
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className={`p-4 ${banData.status === 'banned' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'} border rounded-xl`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 ${banData.status === 'banned' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'} mt-0.5 flex-shrink-0`} />
              <div>
                <h4 className={`text-sm font-semibold ${banData.status === 'banned' ? 'text-red-800 dark:text-red-300' : 'text-orange-800 dark:text-orange-300'} mb-1`}>
                  ⚠️ Warning: User {banData.status === 'banned' ? 'Ban' : 'Suspension'} Action
                </h4>
                <p className={`text-xs ${banData.status === 'banned' ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
                  You are about to {banData.status} <strong className="font-bold">{selectedUser?.name}</strong>. This will prevent them from accessing the platform.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20">
            <img 
              src={selectedUser?.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser?.name}&background=7E29F0&color=fff`}
              alt={selectedUser?.name}
              className="h-16 w-16 rounded-xl object-cover border-2 border-purple-500/20"
            />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{selectedUser?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-md border border-purple-200/20">
                  {selectedUser?.videos?.length || 0} videos
                </span>
                <span className="text-xs px-2 py-1 bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-md border border-purple-200/20">
                  {selectedUser?.posts?.length || 0} posts
                </span>
              </div>
            </div>
          </div>

          {/* Action Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Action Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBanData({ ...banData, status: 'banned' })}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  banData.status === 'banned'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-red-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Ban className={`w-4 h-4 ${banData.status === 'banned' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${banData.status === 'banned' ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    Ban Account
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Prohibit access due to violations
                </p>
              </button>

              {/* <button
                onClick={() => setBanData({ ...banData, status: 'suspended' })}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  banData.status === 'suspended'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className={`w-4 h-4 ${banData.status === 'suspended' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${banData.status === 'suspended' ? 'text-orange-700 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    Suspend Account
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Restrict during investigation
                </p>
              </button> */}
            </div>
          </div>

          {/* Duration Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Duration
            </label>
            
            {/* Permanent Toggle */}
            <div className="mb-3">
              <label className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                <input
                  type="checkbox"
                  checked={banData.isPermanent}
                  onChange={(e) => setBanData({ ...banData, isPermanent: e.target.checked, duration: '' })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">Permanent {banData.status === 'banned' ? 'Ban' : 'Suspension'}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No automatic expiry, requires manual reactivation</p>
                </div>
              </label>
            </div>

            {/* Temporary Duration */}
            {!banData.isPermanent && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Temporary Duration (days)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[7, 30, 60, 90].map((days) => (
                    <button
                      key={days}
                      onClick={() => setBanData({ ...banData, duration: days.toString() })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        banData.duration === days.toString()
                          ? 'bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white shadow-lg'
                          : 'bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={banData.duration}
                  onChange={(e) => setBanData({ ...banData, duration: e.target.value })}
                  placeholder="Or enter custom days..."
                  min="1"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
            )}
          </div>

          {/* Ban Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Reason for {banData.status === 'banned' ? 'Ban' : 'Suspension'} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={banData.reason}
              onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
              placeholder={`Provide a detailed reason for ${banData.status === 'banned' ? 'banning' : 'suspending'} this user...`}
              rows={4}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
            />
            <div className="flex items-start gap-2 mt-2">
              <Shield className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This reason will be shown to the user when they attempt to login.
              </p>
            </div>
          </div>

          {/* Summary */}
          {banData.reason && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Action Summary:</h5>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• User will be <strong className="text-gray-900 dark:text-white">{banData.status}</strong></li>
                <li>• Duration: <strong className="text-gray-900 dark:text-white">{banData.isPermanent ? 'Permanent' : `${banData.duration} days`}</strong></li>
                <li>• They will see: "<em>{banData.reason}</em>"</li>
                {!banData.isPermanent && banData.duration && (
                  <li>• Account auto-reactivates on: <strong className="text-gray-900 dark:text-white">
                    {new Date(Date.now() + parseInt(banData.duration) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </strong></li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                setBanModalOpen(false);
                setBanData({ status: 'banned', reason: '', duration: '', isPermanent: false });
              }}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleBanUser}
              disabled={banLoading || !banData.reason.trim() || (!banData.isPermanent && !banData.duration)}
              className={`flex-1 px-6 py-3 bg-gradient-to-r ${
                banData.status === 'banned' 
                  ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
            >
              {banLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {banData.status === 'banned' ? 'Banning...' : 'Suspending...'}
                </>
              ) : (
                <>
                  <Ban size={18} />
                  {banData.status === 'banned' ? 'Ban' : 'Suspend'} User
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        <div className="space-y-6">
          {/* User Header */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7E29F0] via-[#561E97] to-[#190830] rounded-2xl"></div>
            <div className="absolute inset-0 opacity-10 rounded-2xl" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}></div>
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <img 
                  src={selectedUser?.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser?.name}&background=7E29F0&color=fff`}
                  alt={selectedUser?.name}
                  className="h-20 w-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">{selectedUser?.name}</h3>
                    {selectedUser?.status === 'active' ? (
                      <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-green-400/20 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : selectedUser?.status === 'banned' ? (
                      <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-red-400/20 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Banned
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-orange-400/20 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-purple-100">
                      <Mail size={14} />
                      <span className="text-sm">{selectedUser?.email}</span>
                    </div>
                    {selectedUser?.username && (
                      <div className="flex items-center gap-2 text-purple-100">
                        <span className="text-sm">@{selectedUser.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={14} className="text-white" />
                    <span className="text-xs text-purple-100">Videos</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selectedUser?.videos?.length || 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon size={14} className="text-white" />
                    <span className="text-xs text-purple-100">Posts</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selectedUser?.posts?.length || 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive size={14} className="text-white" />
                    <span className="text-xs text-purple-100">Accounts</span>
                  </div>
                  <p className="text-xl font-bold text-white">{selectedUser?.socialAccounts?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UsersIcon size={16} className="text-[#7E29F0]" />
              Account Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Login Type</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{selectedUser?.loginType || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/20 dark:border-blue-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Email Verified</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedUser?.emailVerified ? '✅ Yes' : '❌ No'}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/20 dark:border-green-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Join Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedUser?.createdAt && new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedUser?.lastLoginAt && (
                <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200/20 dark:border-teal-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-teal-600 dark:text-teal-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Last Login</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedUser.lastLoginAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/20 dark:border-yellow-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Bundle Registered</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedUser?.bundleRegistered ? '✅ Yes' : '❌ No'}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200/20 dark:border-red-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Login Attempts</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedUser?.loginAttempts || 0}
                </p>
              </div>

              {selectedUser?.dateOfBirth && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/20 dark:border-indigo-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Date of Birth</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedUser.dateOfBirth).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {selectedUser?.gender && (
                <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200/20 dark:border-pink-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <UsersIcon size={14} className="text-pink-600 dark:text-pink-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Gender</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedUser.gender}
                  </p>
                </div>
              )}

              {selectedUser?.phoneNumber && (
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/20 dark:border-emerald-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedUser.phoneNumber}
                  </p>
                </div>
              )}

              {selectedUser?.passwordChangedAt && (
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/20 dark:border-violet-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={14} className="text-violet-600 dark:text-violet-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Password Changed</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedUser.passwordChangedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {selectedUser?.updatedAt && (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl border border-slate-200/20 dark:border-slate-700/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Last Updated</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User ID Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield size={16} className="text-[#7E29F0]" />
              User ID
            </h4>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                {selectedUser?._id}
              </p>
            </div>
          </div>

          {/* Bundle Information */}
          {(selectedUser?.bundleOrganizationId || selectedUser?.bundleTeamId) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HardDrive size={16} className="text-[#7E29F0]" />
                Bundle Social Information
              </h4>
              <div className="space-y-2">
                {selectedUser.bundleOrganizationId && (
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Organization ID</p>
                    <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {selectedUser.bundleOrganizationId}
                    </p>
                  </div>
                )}
                {selectedUser.bundleTeamId && (
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Team ID</p>
                    <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {selectedUser.bundleTeamId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {selectedUser?.preferences && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-[#7E29F0]" />
                User Preferences
              </h4>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Default Platforms</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {selectedUser.preferences.defaultPlatforms?.length > 0 
                        ? selectedUser.preferences.defaultPlatforms.join(', ')
                        : 'None set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Accounts */}
          {selectedUser?.socialAccounts && selectedUser.socialAccounts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HardDrive size={16} className="text-[#7E29F0]" />
                Connected Social Accounts
              </h4>
              <div className="space-y-2">
                {selectedUser.socialAccounts.map((account, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                        {account.platform || account.type || 'Unknown Platform'}
                      </p>
                      {account.username && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{account.username}</p>
                      )}
                    </div>
                    {account.isActive && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ban/Suspension Info */}
          {(selectedUser?.status === 'banned' || selectedUser?.status === 'suspended') && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                    Account {selectedUser.status === 'banned' ? 'Banned' : 'Suspended'}
                  </h4>
                  {selectedUser.banReason && (
                    <p className="text-xs text-red-700 dark:text-red-400 mb-2">
                      <strong>Reason:</strong> {selectedUser.banReason}
                    </p>
                  )}
                  {selectedUser.banExpiry && (
                    <p className="text-xs text-red-700 dark:text-red-400">
                      <strong>Expires:</strong> {new Date(selectedUser.banExpiry).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {selectedUser?.bio && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Bio</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                {selectedUser.bio}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                setDetailsModalOpen(false);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Delete User Account"
      >
        <div className="space-y-6">
          {/* Critical Warning */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                  🚨 Critical: Permanent Deletion
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400">
                  This action <strong>CANNOT be undone</strong>. All user data will be permanently deleted from the system.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <img 
              src={selectedUser?.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser?.name}&background=7E29F0&color=fff`}
              alt={selectedUser?.name}
              className="h-16 w-16 rounded-xl object-cover border-2 border-gray-300 dark:border-gray-600"
            />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{selectedUser?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {selectedUser?.createdAt && new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* What will be deleted */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white">The following will be permanently deleted:</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser?.videos?.length || 0} Videos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Including Cloudinary assets</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser?.posts?.length || 0} Posts
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">All social media posts</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUser?.socialAccounts?.length || 0} Social Accounts
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Connected platforms</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Account & Settings
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profile, preferences, history</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> Consider banning the user instead if you might need to restore their account later.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={deleteLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Permanently Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
