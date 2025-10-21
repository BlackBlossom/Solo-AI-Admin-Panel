import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  UserCog, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  Search, 
  Filter,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Crown,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { adminService } from '../services/adminService';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ 
    page: 1, 
    limit: 20, 
    search: '',
    role: '', // all, superadmin, admin, moderator
    isActive: '', // all, true, false
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [restrictModalOpen, setRestrictModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: []
  });

  const [restrictData, setRestrictData] = useState({
    isActive: false,
    reason: ''
  });

  const location = useLocation();

  // Available permissions
  const availablePermissions = [
    { value: 'users', label: 'User Management', icon: Users },
    { value: 'media', label: 'Media Library', icon: '🎨' },
    { value: 'videos', label: 'Video Management', icon: '🎥' },
    { value: 'posts', label: 'Post Management', icon: '📱' },
    { value: 'analytics', label: 'Analytics & Reporting', icon: '📊' },
    { value: 'settings', label: 'System Settings', icon: '⚙️' },
    { value: 'socialaccounts', label: 'Social Accounts', icon: '🔗' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchAdmins();
  }, [filters.page, filters.sortBy, filters.sortOrder]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await adminService.getAll(cleanFilters);
      setAdmins(response.data?.admins || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load admins');
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch = 
        admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || admin.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && admin.isActive) ||
        (selectedStatus === 'inactive' && !admin.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchQuery, selectedRole, selectedStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: admins.length,
      superadmins: admins.filter(a => a.role === 'superadmin').length,
      admins: admins.filter(a => a.role === 'admin').length,
      moderators: admins.filter(a => a.role === 'moderator').length,
      active: admins.filter(a => a.isActive).length,
      inactive: admins.filter(a => !a.isActive).length
    };
  }, [admins]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await adminService.create(formData);
      toast.success('Admin created successfully');
      setCreateModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions
      };
      
      await adminService.update(selectedAdmin._id, updateData);
      toast.success('Admin updated successfully');
      setEditModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleRestrictAdmin = async () => {
    if (!restrictData.reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await adminService.restrict(selectedAdmin._id, restrictData);
      toast.success(restrictData.isActive ? 'Admin activated successfully' : 'Admin restricted successfully');
      setRestrictModalOpen(false);
      setRestrictData({ isActive: false, reason: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin status');
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await adminService.delete(selectedAdmin._id);
      toast.success('Admin deleted successfully');
      setDeleteModalOpen(false);
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions || []
    });
    setEditModalOpen(true);
  };

  const openRestrictModal = (admin) => {
    setSelectedAdmin(admin);
    setRestrictData({
      isActive: !admin.isActive,
      reason: ''
    });
    setRestrictModalOpen(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setDeleteModalOpen(true);
  };

  const openDetailsModal = (admin) => {
    setSelectedAdmin(admin);
    setDetailsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      permissions: []
    });
    setSelectedAdmin(null);
  };

  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30';
      case 'admin': return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30';
      case 'moderator': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin': return <ShieldCheck className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'moderator': return <ShieldAlert className="w-4 h-4" />;
      default: return <ShieldOff className="w-4 h-4" />;
    }
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
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Admin Management
                </h1>
              </div>
              <p className="text-purple-100 text-lg">
                Manage admin accounts, roles, and permissions across the platform
              </p>
            </motion.div>
            
            {/* Create Admin Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Create Admin
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <UserCog size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Admins</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
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
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <Crown size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Superadmins</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.superadmins}
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
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Admins</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.admins}
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
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <ShieldAlert size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Moderators</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.moderators}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.active}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <XCircle size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Inactive</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.inactive}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8 relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Role Filter */}
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">⭐ Superadmin</option>
                <option value="admin">🛡️ Admin</option>
                <option value="moderator">👮 Moderator</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">❌ Inactive</option>
              </select>
              <Activity className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admins Table/Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
              />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading admins...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <ShieldOff className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-900 dark:text-gray-100 text-xl font-semibold">No admins found</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left p-6 text-gray-600 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">Admin</th>
                    <th className="text-left p-6 text-gray-600 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">Role</th>
                    <th className="text-left p-6 text-gray-600 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">Permissions</th>
                    <th className="text-left p-6 text-gray-600 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="text-left p-6 text-gray-600 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">Created</th>
                    <th className="text-left p-6 text-gray-600 dark:text-gray-300 font-semibold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredAdmins.map((admin, index) => (
                      <motion.tr
                        key={admin._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className="relative"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                            </motion.div>
                            
                            <div>
                              <p className="text-gray-900 dark:text-white font-semibold text-lg">{admin.name}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3" />
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-xl ${getRoleBadgeColor(admin.role)} shadow-lg`}>
                            {getRoleIcon(admin.role)}
                            <span className="capitalize text-sm font-semibold">{admin.role}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          {admin.role === 'superadmin' ? (
                            <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-sm font-semibold">All Permissions</span>
                            </div>
                          ) : admin.permissions?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {admin.permissions.slice(0, 2).map((perm) => (
                                <span
                                  key={perm}
                                  className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs rounded-lg border border-purple-500/30 backdrop-blur-xl font-medium"
                                >
                                  {perm}
                                </span>
                              ))}
                              {admin.permissions.length > 2 && (
                                <span className="px-3 py-1 bg-gray-500/20 text-gray-600 dark:text-gray-300 text-xs rounded-lg border border-gray-500/30 backdrop-blur-xl font-medium">
                                  +{admin.permissions.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm italic">No permissions</span>
                          )}
                        </td>
                        <td className="p-6">
                          {admin.isActive ? (
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl border border-green-500/30 backdrop-blur-xl"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Active</span>
                            </motion.div>
                          ) : (
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl border border-red-500/30 backdrop-blur-xl"
                            >
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Inactive</span>
                            </motion.div>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{new Date(admin.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDetailsModal(admin)}
                              className="p-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30 backdrop-blur-xl"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            {admin.role !== 'superadmin' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openEditModal(admin)}
                                  className="p-2.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all border border-purple-500/30 backdrop-blur-xl"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openRestrictModal(admin)}
                                  className={`p-2.5 rounded-lg transition-all border backdrop-blur-xl ${
                                    admin.isActive
                                      ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/30 border-orange-500/30'
                                      : 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 border-green-500/30'
                                  }`}
                                  title={admin.isActive ? 'Restrict' : 'Activate'}
                                >
                                  {admin.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openDeleteModal(admin)}
                                  className="p-2.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 backdrop-blur-xl"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      )}

      {/* Create Admin Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetForm();
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Create New Admin</span>
          </div>
        }
      >
        <form onSubmit={handleCreateAdmin} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <UserCog className="w-4 h-4" />
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-500"
              placeholder="Enter admin name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Mail className="w-4 h-4" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-500"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value;
                setFormData({ 
                  ...formData, 
                  role: newRole,
                  permissions: newRole === 'superadmin' 
                    ? availablePermissions.map(p => p.value)
                    : formData.permissions
                });
              }}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="admin">🛡️ Admin</option>
              <option value="moderator">👮 Moderator</option>
              <option value="superadmin">⭐ Superadmin</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Permissions
            </label>
            {formData.role === 'superadmin' && (
              <p className="text-yellow-400 text-xs flex items-center gap-2">
                <Crown className="w-3 h-3" />
                Superadmin has all permissions by default
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePermissions.map((perm) => (
                <motion.label
                  key={perm.value}
                  whileHover={{ scale: formData.role !== 'superadmin' ? 1.02 : 1 }}
                  whileTap={{ scale: formData.role !== 'superadmin' ? 0.98 : 1 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.permissions.includes(perm.value)
                      ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'bg-[#0f0520]/50 border-purple-500/20 hover:border-purple-500/40'
                  } ${formData.role === 'superadmin' ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                    disabled={formData.role === 'superadmin'}
                    className="w-5 h-5 rounded border-purple-500/30 text-purple-500 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-300 font-medium">{perm.label}</span>
                </motion.label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 rounded-xl shadow-2xl shadow-purple-500/50 border border-purple-400/30 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Create Admin
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                resetForm();
              }}
              className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 backdrop-blur-xl text-white font-semibold py-4 rounded-xl border border-gray-500/30 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          resetForm();
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Edit Admin</span>
          </div>
        }
      >
        <form onSubmit={handleUpdateAdmin} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <UserCog className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value;
                setFormData({ 
                  ...formData, 
                  role: newRole,
                  permissions: newRole === 'superadmin' 
                    ? availablePermissions.map(p => p.value)
                    : formData.permissions
                });
              }}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="admin">🛡️ Admin</option>
              <option value="moderator">👮 Moderator</option>
              <option value="superadmin">⭐ Superadmin</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Permissions
            </label>
            {formData.role === 'superadmin' && (
              <p className="text-yellow-400 text-xs flex items-center gap-2">
                <Crown className="w-3 h-3" />
                Superadmin has all permissions by default
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePermissions.map((perm) => (
                <motion.label
                  key={perm.value}
                  whileHover={{ scale: formData.role !== 'superadmin' ? 1.02 : 1 }}
                  whileTap={{ scale: formData.role !== 'superadmin' ? 0.98 : 1 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.permissions.includes(perm.value)
                      ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'bg-[#0f0520]/50 border-purple-500/20 hover:border-purple-500/40'
                  } ${formData.role === 'superadmin' ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                    disabled={formData.role === 'superadmin'}
                    className="w-5 h-5 rounded border-purple-500/30 text-purple-500 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-300 font-medium">{perm.label}</span>
                </motion.label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 rounded-xl shadow-2xl shadow-purple-500/50 border border-purple-400/30 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Update Admin
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                resetForm();
              }}
              className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 backdrop-blur-xl text-white font-semibold py-4 rounded-xl border border-gray-500/30 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Restrict/Activate Modal */}
      <Modal
        isOpen={restrictModalOpen}
        onClose={() => {
          setRestrictModalOpen(false);
          setRestrictData({ isActive: false, reason: '' });
        }}
        title={
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${restrictData.isActive ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
              {restrictData.isActive ? <Unlock className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
            </div>
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {restrictData.isActive ? 'Activate Admin' : 'Restrict Admin'}
            </span>
          </div>
        }
      >
        <div className="space-y-5">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-5 rounded-2xl border backdrop-blur-xl ${
              restrictData.isActive 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-orange-500/10 border-orange-500/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${restrictData.isActive ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                <AlertCircle className={`w-6 h-6 ${restrictData.isActive ? 'text-green-400' : 'text-orange-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">
                  {restrictData.isActive ? 'Activate' : 'Restrict'} {selectedAdmin?.name}?
                </p>
                <p className="text-gray-400 mt-2 leading-relaxed">
                  {restrictData.isActive 
                    ? 'This admin will be able to login and access the system again.'
                    : 'This admin will not be able to login or access the system anymore.'}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
              <Edit className="w-4 h-4" />
              Reason *
            </label>
            <textarea
              value={restrictData.reason}
              onChange={(e) => setRestrictData({ ...restrictData, reason: e.target.value })}
              className="w-full bg-[#0f0520]/80 backdrop-blur-xl border border-purple-500/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-500 resize-none"
              placeholder={restrictData.isActive ? "Reason for activation..." : "Reason for restriction..."}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRestrictAdmin}
              className={`flex-1 text-white font-semibold py-4 rounded-xl shadow-2xl border transition-all ${
                restrictData.isActive
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-400/30 shadow-green-500/50'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border-orange-400/30 shadow-orange-500/50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {restrictData.isActive ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {restrictData.isActive ? 'Activate' : 'Restrict'}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setRestrictModalOpen(false);
                setRestrictData({ isActive: false, reason: '' });
              }}
              className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 backdrop-blur-xl text-white font-semibold py-4 rounded-xl border border-gray-500/30 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Delete Admin Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">Delete Admin</span>
          </div>
        }
      >
        <div className="space-y-5">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">Delete {selectedAdmin?.name}?</p>
                <p className="text-gray-400 mt-2 leading-relaxed">
                  This action cannot be undone. The admin account will be permanently deleted from the system.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAdmin}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold py-4 rounded-xl shadow-2xl shadow-red-500/50 border border-red-400/30 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Permanently
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 backdrop-blur-xl text-white font-semibold py-4 rounded-xl border border-gray-500/30 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Admin Details</span>
          </div>
        }
      >
        {selectedAdmin && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-2xl" />
              <div className="relative flex items-center gap-5 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 backdrop-blur-xl">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 blur-lg opacity-50" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-purple-400/30">
                    <span className="text-3xl font-bold text-white">
                      {selectedAdmin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {selectedAdmin.name}
                  </h3>
                  <p className="text-gray-400 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedAdmin.email}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 backdrop-blur-xl"
              >
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Role</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-xl ${getRoleBadgeColor(selectedAdmin.role)} shadow-lg`}>
                  {getRoleIcon(selectedAdmin.role)}
                  <span className="capitalize text-sm font-semibold">{selectedAdmin.role}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 backdrop-blur-xl"
              >
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Status</p>
                {selectedAdmin.isActive ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl border border-green-500/30 backdrop-blur-xl shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Active</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 backdrop-blur-xl shadow-lg">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Inactive</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 backdrop-blur-xl"
              >
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Created At</p>
                <p className="text-white flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {new Date(selectedAdmin.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 backdrop-blur-xl"
              >
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Last Login</p>
                <p className="text-white flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-purple-400" />
                  {selectedAdmin.lastLoginAt 
                    ? new Date(selectedAdmin.lastLoginAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'Never'}
                </p>
              </motion.div>
            </div>

            {/* Permissions Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <p className="text-gray-300 font-semibold text-lg">Permissions</p>
              </div>
              {selectedAdmin.role === 'superadmin' ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <p className="text-yellow-400 font-semibold">All Permissions (Superadmin)</p>
                  </div>
                </div>
              ) : selectedAdmin.permissions?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAdmin.permissions.map((perm, index) => (
                    <motion.span
                      key={perm}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-xl border border-purple-500/40 backdrop-blur-xl font-medium shadow-lg"
                    >
                      {availablePermissions.find(p => p.value === perm)?.label || perm}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No permissions assigned</p>
              )}
            </motion.div>

            {/* Created By Section */}
            {selectedAdmin.createdBy && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <UserCog className="w-5 h-5 text-blue-400" />
                  <p className="text-gray-300 font-semibold">Created By</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {selectedAdmin.createdBy.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedAdmin.createdBy.name}</p>
                    <p className="text-gray-400 text-sm">{selectedAdmin.createdBy.email}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admins;
