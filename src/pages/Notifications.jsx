import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  Plus,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Target,
  Radio,
  User,
  Globe,
  Mail,
  MessageSquare,
  Gift,
  Megaphone,
  Zap,
  TestTube,
  BarChart3,
  Calendar,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { imageService } from '../services/imageService';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    type: '',
    status: '',
    targetType: ''
  });

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Firebase health state
  const [firebaseHealth, setFirebaseHealth] = useState(null);

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Send notification form state
  const [sendForm, setSendForm] = useState({
    title: '',
    body: '',
    type: 'announcement',
    targetType: 'all',
    targetUserId: '',
    targetSegment: {
      loginType: '',
      status: '',
      createdAfter: '',
      createdBefore: ''
    },
    priority: 'high',
    imageUrl: '',
    deepLink: '',
    data: {}
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [targetCount, setTargetCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  
  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Test notification state
  const [testToken, setTestToken] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  
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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll(filters);
      setNotifications(data.data?.notifications || []);
      setPagination(data.meta?.pagination || {});
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await notificationService.getStats(30);
      setStats(data.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Check Firebase health
  const checkFirebaseHealth = async () => {
    try {
      const data = await notificationService.checkFirebaseHealth();
      setFirebaseHealth(data);
    } catch (error) {
      console.error('Firebase health check failed:', error);
      setFirebaseHealth({ status: 'error', message: 'Firebase service unavailable' });
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    checkFirebaseHealth();
  }, [filters.page, filters.limit, filters.type, filters.status, filters.targetType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchNotifications();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.search]);

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // View notification details
  const handleView = async (notification) => {
    try {
      setViewLoading(true);
      setIsViewModalOpen(true);
      const data = await notificationService.getById(notification._id);
      setSelectedNotification(data.data.notification);
    } catch (error) {
      console.error('Error fetching notification details:', error);
      toast.error('Failed to fetch notification details');
      setIsViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // Get target count preview
  const handleGetTargetCount = async () => {
    try {
      setCountLoading(true);
      const targetData = {
        targetType: sendForm.targetType,
        targetUserId: sendForm.targetUserId || undefined,
        targetSegment: sendForm.targetType === 'segment' ? sendForm.targetSegment : undefined
      };
      const data = await notificationService.getTargetCount(targetData);
      setTargetCount(data.data);
    } catch (error) {
      console.error('Error getting target count:', error);
      toast.error('Failed to get target count');
    } finally {
      setCountLoading(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      setImageUploading(true);
      const data = await imageService.upload(imageFile);
      
      console.log('Image uploaded:', data);
      
      // Update form with the public URL
      setSendForm(prev => ({ ...prev, imageUrl: data.data.url }));
      toast.success('Image uploaded successfully!');
      
      // Clear file input but keep preview until server image loads
      setImageFile(null);
      
      // Don't clear imagePreview immediately - it will be replaced by the server URL
      setTimeout(() => {
        setImagePreview(null);
      }, 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = async () => {
    if (!sendForm.imageUrl) return;

    try {
      // Extract filename from URL
      const filename = sendForm.imageUrl.split('/').pop();
      
      await imageService.delete(filename);

      // Clear image from form
      setSendForm(prev => ({ ...prev, imageUrl: '' }));
      setImagePreview(null);
      setImageFile(null);
      toast.success('Image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error(error.response?.data?.message || 'Failed to remove image');
    }
  };

  // Clear image preview without deleting from server
  const handleClearImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Send notification
  const handleSend = async () => {
    try {
      // Validation
      if (!sendForm.title.trim() || !sendForm.body.trim()) {
        toast.error('Title and body are required');
        return;
      }

      if (sendForm.targetType === 'individual' && !sendForm.targetUserId) {
        toast.error('User ID is required for individual targeting');
        return;
      }

      setSendLoading(true);
      
      const notificationData = {
        title: sendForm.title,
        body: sendForm.body,
        type: sendForm.type,
        targetType: sendForm.targetType,
        priority: sendForm.priority,
        ...(sendForm.imageUrl && { imageUrl: sendForm.imageUrl }),
        ...(sendForm.deepLink && { deepLink: sendForm.deepLink }),
        ...(sendForm.targetType === 'individual' && { targetUserId: sendForm.targetUserId }),
        ...(sendForm.targetType === 'segment' && { targetSegment: sendForm.targetSegment }),
        ...(Object.keys(sendForm.data).length > 0 && { data: sendForm.data })
      };

      await notificationService.send(notificationData);
      toast.success('Notification sent successfully!');
      setIsSendModalOpen(false);
      
      // Reset form
      setSendForm({
        title: '',
        body: '',
        type: 'announcement',
        targetType: 'all',
        targetUserId: '',
        targetSegment: {
          loginType: '',
          status: '',
          createdAfter: '',
          createdBefore: ''
        },
        priority: 'high',
        imageUrl: '',
        deepLink: '',
        data: {}
      });
      setTargetCount(null);
      
      // Refresh notifications list
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendLoading(false);
    }
  };

  // Send test notification
  const handleSendTest = async () => {
    try {
      if (!testToken.trim()) {
        toast.error('Device token is required');
        return;
      }

      setTestLoading(true);
      await notificationService.sendTest(testToken);
      toast.success('Test notification sent successfully!');
      setIsTestModalOpen(false);
      setTestToken('');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send test notification');
    } finally {
      setTestLoading(false);
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return Megaphone;
      case 'promotion': return Gift;
      case 'content_update': return Sparkles;
      case 'account_alert': return AlertCircle;
      default: return Bell;
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'announcement': return 'blue';
      case 'promotion': return 'green';
      case 'content_update': return 'purple';
      case 'account_alert': return 'orange';
      default: return 'gray';
    }
  };

  // Get target type icon
  const getTargetTypeIcon = (targetType) => {
    switch (targetType) {
      case 'all': return Globe;
      case 'individual': return User;
      case 'segment': return Target;
      default: return Users;
    }
  };

  // Get status icon and color
  const getStatusDetails = (status) => {
    switch (status) {
      case 'sent':
        return { icon: CheckCircle, color: 'green', label: 'Sent' };
      case 'failed':
        return { icon: XCircle, color: 'red', label: 'Failed' };
      case 'pending':
        return { icon: Clock, color: 'yellow', label: 'Pending' };
      default:
        return { icon: Radio, color: 'gray', label: status };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Push Notifications
                </h1>
              </div>
              <p className="text-purple-100 text-lg">
                Send and manage push notifications via Firebase Cloud Messaging
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsTestModalOpen(true)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white"
              >
                <TestTube size={18} />
                <span className="hidden sm:inline">Test Notification</span>
                <span className="sm:hidden">Test</span>
              </Button>
              <Button
                onClick={() => setIsSendModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-semibold shadow-xl"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Send Notification</span>
                <span className="sm:hidden">Send</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Firebase Health Status */}
      {firebaseHealth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`relative backdrop-blur-xl border rounded-2xl p-6 shadow-xl ${
            firebaseHealth.status === 'success' 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                firebaseHealth.status === 'success' 
                  ? 'bg-green-500/20' 
                  : 'bg-red-500/20'
              }`}>
                {firebaseHealth.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-lg ${
                  firebaseHealth.status === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                  {firebaseHealth.message || 'Firebase Status'}
                </p>
                {firebaseHealth.data?.projectId && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Project ID: {firebaseHealth.data.projectId}
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-lg font-medium ${
                firebaseHealth.status === 'success' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {firebaseHealth.status === 'success' ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Send size={20} className="text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Notifications</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalNotifications?.toLocaleString() || 0}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.successRate ? `${parseFloat(stats.successRate).toFixed(1)}%` : '0%'}
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
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Users size={20} className="text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Sent</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalSent?.toLocaleString() || 0}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <XCircle size={20} className="text-white" />
                </div>
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Failed</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalFailed?.toLocaleString() || 0}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Filter size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-lg">Filter & Search</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search notifications..."
                  value={filters.search}
                />
              </div>

              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              >
                <option value="">All Types</option>
                <option value="announcement">Announcement</option>
                <option value="promotion">Promotion</option>
                <option value="content_update">Content Update</option>
                <option value="account_alert">Account Alert</option>
                <option value="custom">Custom</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              >
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>

              {/* Target Type Filter */}
              <select
                value={filters.targetType}
                onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value, page: 1 }))}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              >
                <option value="">All Targets</option>
                <option value="all">Broadcast (All)</option>
                <option value="individual">Individual</option>
                <option value="segment">Segment</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 bg-purple-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Bell className="w-12 h-12 text-purple-300/50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications found</h3>
              <p className="text-gray-600 dark:text-gray-400">Send your first notification to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Title</th>
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Type</th>
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Target</th>
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Status</th>
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Stats</th>
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Created</th>
                    <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => {
                    const TypeIcon = getTypeIcon(notification.type);
                    const TargetIcon = getTargetTypeIcon(notification.targetType);
                    const statusDetails = getStatusDetails(notification.status);
                    const StatusIcon = statusDetails.icon;

                    return (
                      <motion.tr
                        key={notification._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-purple-500/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{notification.title}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs">
                              {notification.body}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge color={getTypeColor(notification.type)}>
                            <TypeIcon size={14} className="mr-1" />
                            {notification.type}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <TargetIcon size={16} />
                            <span className="text-sm capitalize">{notification.targetType}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge color={statusDetails.color}>
                            <StatusIcon size={14} className="mr-1" />
                            {statusDetails.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              ✓ {notification.stats?.totalSent || 0}
                            </div>
                            <div className="text-red-600 dark:text-red-400 font-medium">
                              ✗ {notification.stats?.totalFailed || 0}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-white">{formatDate(notification.createdAt)}</p>
                            {notification.createdBy?.name && (
                              <p className="text-gray-600 dark:text-gray-400 text-xs">by {notification.createdBy.name}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            onClick={() => handleView(notification)}
                            size="sm"
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          >
                            <Eye size={16} />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* View Notification Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span>Notification Details</span>
          </div>
        }
      >
        {viewLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : selectedNotification ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                <Bell className="w-4 h-4" />
                Title
              </label>
              <p className="text-gray-900 dark:text-white font-medium bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                {selectedNotification.title}
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                <MessageSquare className="w-4 h-4" />
                Message
              </label>
              <p className="text-gray-900 dark:text-white bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                {selectedNotification.body}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Type</label>
                <p className="text-gray-900 dark:text-white capitalize bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  {selectedNotification.type.replace('_', ' ')}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Priority</label>
                <p className="text-gray-900 dark:text-white capitalize bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  {selectedNotification.priority}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Target Type</label>
                <p className="text-gray-900 dark:text-white capitalize bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  {selectedNotification.targetType}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Status</label>
                <div className="bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Badge color={getStatusDetails(selectedNotification.status).color}>
                    {selectedNotification.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20 p-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Delivery Statistics
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">Targeted</label>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold mt-1">
                    {selectedNotification.stats?.totalTargeted || 0}
                  </p>
                </div>
                <div className="text-center">
                  <label className="text-green-600 dark:text-green-400 text-xs font-medium">Sent</label>
                  <p className="text-green-600 dark:text-green-400 text-2xl font-bold mt-1">
                    {selectedNotification.stats?.totalSent || 0}
                  </p>
                </div>
                <div className="text-center">
                  <label className="text-blue-600 dark:text-blue-400 text-xs font-medium">Delivered</label>
                  <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold mt-1">
                    {selectedNotification.stats?.totalDelivered || 0}
                  </p>
                </div>
                <div className="text-center">
                  <label className="text-red-600 dark:text-red-400 text-xs font-medium">Failed</label>
                  <p className="text-red-600 dark:text-red-400 text-2xl font-bold mt-1">
                    {selectedNotification.stats?.totalFailed || 0}
                  </p>
                </div>
              </div>
            </div>

            {selectedNotification.imageUrl && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  <ImageIcon className="w-4 h-4" />
                  Image URL
                </label>
                <p className="text-purple-600 dark:text-purple-400 text-sm bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 break-all">
                  {selectedNotification.imageUrl}
                </p>
              </div>
            )}

            {selectedNotification.deepLink && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  <Zap className="w-4 h-4" />
                  Deep Link
                </label>
                <p className="text-purple-600 dark:text-purple-400 text-sm bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 break-all">
                  {selectedNotification.deepLink}
                </p>
              </div>
            )}

            {selectedNotification.createdBy && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  <User className="w-4 h-4" />
                  Created By
                </label>
                <p className="text-gray-900 dark:text-white bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  {selectedNotification.createdBy.name} ({selectedNotification.createdBy.email})
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                <Calendar className="w-4 h-4" />
                Created At
              </label>
              <p className="text-gray-900 dark:text-white bg-white/50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                {formatDate(selectedNotification.createdAt)}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Send Notification Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setTargetCount(null);
          setImageFile(null);
          setImagePreview(null);
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span>Send Push Notification</span>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <Bell className="w-4 h-4" />
              Title *
            </label>
            <input
              type="text"
              value={sendForm.title}
              onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400"
              placeholder="Enter notification title"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <MessageSquare className="w-4 h-4" />
              Message *
            </label>
            <textarea
              value={sendForm.body}
              onChange={(e) => setSendForm(prev => ({ ...prev, body: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400 resize-none"
              placeholder="Enter notification message"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Type
              </label>
              <select
                value={sendForm.type}
                onChange={(e) => setSendForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="announcement">📢 Announcement</option>
                <option value="promotion">🎁 Promotion</option>
                <option value="content_update">✨ Content Update</option>
                <option value="account_alert">⚠️ Account Alert</option>
                <option value="custom">🔧 Custom</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                Priority
              </label>
              <select
                value={sendForm.priority}
                onChange={(e) => setSendForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="high">🔴 High</option>
                <option value="normal">🟢 Normal</option>
              </select>
            </div>
          </div>

          {/* Target Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <Target className="w-4 h-4" />
              Target Type
            </label>
            <select
              value={sendForm.targetType}
              onChange={(e) => {
                setSendForm(prev => ({ ...prev, targetType: e.target.value }));
                setTargetCount(null);
              }}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="all">🌐 Broadcast to All Users</option>
              <option value="individual">👤 Individual User</option>
              <option value="segment">🎯 User Segment</option>
            </select>
          </div>

          {/* Individual User ID */}
          {sendForm.targetType === 'individual' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                <User className="w-4 h-4" />
                User ID *
              </label>
              <input
                type="text"
                value={sendForm.targetUserId}
                onChange={(e) => setSendForm(prev => ({ ...prev, targetUserId: e.target.value }))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400"
                placeholder="Enter user ID"
              />
            </div>
          )}

          {/* Segment Filters */}
          {sendForm.targetType === 'segment' && (
            <div className="space-y-3 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20">
              <p className="text-gray-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Segment Filters
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 dark:text-gray-300 text-xs font-medium mb-1 block">Login Type</label>
                  <select
                    value={sendForm.targetSegment.loginType}
                    onChange={(e) => setSendForm(prev => ({
                      ...prev,
                      targetSegment: { ...prev.targetSegment, loginType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="">Any</option>
                    <option value="email">📧 Email</option>
                    <option value="google">🔵 Google</option>
                    <option value="apple">🍎 Apple</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-300 text-xs font-medium mb-1 block">Account Status</label>
                  <select
                    value={sendForm.targetSegment.status}
                    onChange={(e) => setSendForm(prev => ({
                      ...prev,
                      targetSegment: { ...prev.targetSegment, status: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="">Any</option>
                    <option value="active">✅ Active</option>
                    <option value="inactive">❌ Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-300 text-xs font-medium mb-1 block">Created After</label>
                  <input
                    type="date"
                    value={sendForm.targetSegment.createdAfter}
                    onChange={(e) => setSendForm(prev => ({
                      ...prev,
                      targetSegment: { ...prev.targetSegment, createdAfter: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-300 text-xs font-medium mb-1 block">Created Before</label>
                  <input
                    type="date"
                    value={sendForm.targetSegment.createdBefore}
                    onChange={(e) => setSendForm(prev => ({
                      ...prev,
                      targetSegment: { ...prev.targetSegment, createdBefore: e.target.value }
                    }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <ImageIcon className="w-4 h-4" />
              Notification Image <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>

            {/* Show uploaded image or preview */}
            {(sendForm.imageUrl || imagePreview) && (
              <div className="relative group">
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                  <img
                    src={sendForm.imageUrl || imagePreview}
                    alt="Notification preview"
                    className="w-full h-full object-cover"
                    onLoadStart={() => {
                      setImageLoading(true);
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      setImageLoading(false);
                      toast.error('Failed to load image preview');
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', sendForm.imageUrl || imagePreview);
                      setImageLoading(false);
                    }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {sendForm.imageUrl && (
                      <Button
                        onClick={handleRemoveImage}
                        size="sm"
                        className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
                      >
                        <XCircle size={16} />
                        Remove from Server
                      </Button>
                    )}
                    {imagePreview && !sendForm.imageUrl && (
                      <Button
                        onClick={handleClearImagePreview}
                        size="sm"
                        className="flex items-center gap-2 bg-gray-700 text-white hover:bg-gray-600"
                      >
                        <XCircle size={16} />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                {sendForm.imageUrl && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all">
                    {sendForm.imageUrl}
                  </p>
                )}
              </div>
            )}

            {/* Upload controls */}
            {!sendForm.imageUrl && (
              <div className="space-y-3">
                {/* File input */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="notification-image-upload"
                      disabled={imageUploading}
                    />
                    <label
                      htmlFor="notification-image-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer"
                    >
                      <ImageIcon size={18} />
                      <span>{imageFile ? imageFile.name : 'Choose Image'}</span>
                    </label>
                  </div>
                  
                  {/* Upload button */}
                  {imageFile && !sendForm.imageUrl && (
                    <Button
                      onClick={handleImageUpload}
                      disabled={imageUploading}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                    >
                      {imageUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={16} />
                          <span>Upload</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Manual URL input as alternative */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-transparent text-gray-500">or enter URL manually</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={sendForm.imageUrl}
                  onChange={(e) => setSendForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400"
                  placeholder="https://example.com/image.jpg"
                  disabled={!!imageFile}
                />
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Recommended: 1024x512px, max 10MB (jpg, png, gif, webp)
            </p>
          </div>

          {/* Deep Link */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Deep Link <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={sendForm.deepLink}
              onChange={(e) => setSendForm(prev => ({ ...prev, deepLink: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400"
              placeholder="myapp://screen"
            />
          </div>

          {/* Target Count Preview */}
          <div className="space-y-3">
            <Button
              onClick={handleGetTargetCount}
              disabled={countLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            >
              {countLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Target size={16} />
                  Preview Target Count
                </>
              )}
            </Button>

            {targetCount && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/20 dark:border-blue-700/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Total Users</p>
                      <p className="text-gray-900 dark:text-white font-bold">{targetCount.targetCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Bell size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">With Tokens</p>
                      <p className="text-gray-900 dark:text-white font-bold">{targetCount.usersWithTokens}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                setIsSendModalOpen(false);
                setTargetCount(null);
              }}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Test Notification Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => {
          setIsTestModalOpen(false);
          setTestToken('');
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <span>Send Test Notification</span>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/20 dark:border-blue-700/20 rounded-xl">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Test Firebase Configuration</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a valid Firebase device token to send a test notification and verify your FCM setup.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <Activity className="w-4 h-4" />
              Device Token *
            </label>
            <textarea
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400 resize-none font-mono text-sm"
              placeholder="dXJ4K9xR3kY:APA91bH..."
            />
            <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
              <Info className="w-3 h-3" />
              Get this from your mobile app's Firebase SDK
            </p>
          </div>

          <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                setIsTestModalOpen(false);
                setTestToken('');
              }}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={testLoading || !testToken.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <TestTube size={16} className="mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;
