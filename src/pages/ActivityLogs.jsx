import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { activityLogService } from '../services/activityLogService';
import Pagination from '../components/ui/Pagination';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import {
  Activity,
  Upload,
  Edit,
  Trash2,
  LogIn,
  Settings,
  User,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Shield,
  Eye,
  FileText,
  Database,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1, limit: 50 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('timeline'); // timeline or table

  useEffect(() => {
    fetchLogs();
  }, [filters.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getAll(filters);
      setLogs(response.data?.logs || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load activity logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      upload: Upload,
      update: Edit,
      delete: Trash2,
      login: LogIn,
      settings_update: Settings,
      view: Eye,
      create: FileText,
    };
    const Icon = icons[action] || Activity;
    return Icon;
  };

  const getActionColor = (action) => {
    const colors = {
      upload: 'from-green-500 to-emerald-500',
      update: 'from-blue-500 to-cyan-500',
      delete: 'from-red-500 to-pink-500',
      login: 'from-purple-500 to-indigo-500',
      settings_update: 'from-orange-500 to-amber-500',
      view: 'from-gray-500 to-slate-500',
      create: 'from-teal-500 to-green-500',
    };
    return colors[action] || 'from-purple-500 to-indigo-500';
  };

  const getResourceIcon = (resourceType) => {
    const icons = {
      media: ImageIcon,
      video: VideoIcon,
      user: User,
      settings: Settings,
      database: Database,
    };
    const Icon = icons[resourceType?.toLowerCase()] || FileText;
    return Icon;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.admin?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'success' ? log.success : !log.success);
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  // Get stats
  const stats = {
    total: logs.length,
    success: logs.filter(log => log.success).length,
    failed: logs.filter(log => !log.success).length,
    uniqueAdmins: new Set(logs.map(log => log.admin?._id)).size,
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader size="xl" />
      </div>
    );
  }

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
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Activity Logs
            </h1>
          </motion.div>
          <p className="text-purple-100 text-lg">
            Track all admin actions and system events in real-time
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Activities', value: stats.total, icon: Activity, color: 'from-purple-500 to-indigo-500' },
          { label: 'Successful', value: stats.success, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'from-red-500 to-pink-500' },
          { label: 'Active Admins', value: stats.uniqueAdmins, icon: User, color: 'from-blue-500 to-cyan-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by admin, action, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="all">All Actions</option>
              <option value="upload">Upload</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="settings_update">Settings Update</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-purple-200/50 dark:border-purple-700/50">
          <span className="text-sm text-gray-600 dark:text-gray-400">View Mode:</span>
          <div className="flex gap-2">
            {['timeline', 'table'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'timeline' ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredLogs.map((log, index) => {
              const ActionIcon = getActionIcon(log.action);
              const ResourceIcon = getResourceIcon(log.resourceType);
              const actionColor = getActionColor(log.action);

              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline line */}
                  {index !== filteredLogs.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-transparent dark:from-purple-700" />
                  )}

                  {/* Card */}
                  <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.01]">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`p-3 bg-gradient-to-br ${actionColor} rounded-xl shadow-lg`}>
                          <ActionIcon className="w-6 h-6 text-white" />
                        </div>
                        {/* Status indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                          log.success ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              by <span className="font-medium text-purple-600 dark:text-purple-400">{log.admin?.name}</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-1">
                              <Clock className="w-4 h-4" />
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Resource */}
                          <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <ResourceIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Resource</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {log.resourceType}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {log.details?.title || log.details?.userName || log.resourceId}
                              </p>
                            </div>
                          </div>

                          {/* IP Address */}
                          <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">IP Address</p>
                              <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">
                                {log.ipAddress || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                            <div className={`p-2 rounded-lg ${
                              log.success 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {log.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                              <p className={`text-sm font-semibold ${
                                log.success 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {log.success ? 'Success' : 'Failed'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Admin Email */}
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{log.admin?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-purple-200 dark:border-purple-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200 dark:divide-purple-700">
                  {filteredLogs.map((log, index) => {
                    const ActionIcon = getActionIcon(log.action);
                    const actionColor = getActionColor(log.action);

                    return (
                      <motion.tr
                        key={log._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{log.admin?.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{log.admin?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 bg-gradient-to-br ${actionColor} rounded-lg`}>
                              <ActionIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {log.action.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{log.resourceType}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {log.details?.title || log.details?.userName || log.resourceId}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            log.success
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {log.success ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                            {log.ipAddress || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredLogs.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-12 text-center"
        >
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Activity Logs Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || selectedAction !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Activity logs will appear here once admins perform actions.'}
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.total > 0 && filteredLogs.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
