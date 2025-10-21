import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Video, 
  FileText, 
  Image as ImageIcon,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  ArrowUp,
  BarChart3
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getStats();
      // API returns { status, message, data: { stats, recent } }
      // We need to combine stats and recent for display
      
      // Calculate platform distribution from posts
      const postsArray = response.data?.recent?.posts || [];
      const platformCounts = {};
      
      postsArray.forEach(post => {
        post.platforms?.forEach(platform => {
          const platformName = platform.name.toLowerCase();
          platformCounts[platformName] = (platformCounts[platformName] || 0) + 1;
        });
      });

      // Count published posts
      const publishedPosts = postsArray.filter(post => 
        post.bundleStatus === 'posted' || 
        post.platforms?.some(p => p.status === 'published')
      ).length;

      const statsData = {
        users: {
          total: response.data?.stats?.totalUsers || 0,
          active: response.data?.stats?.totalUsers || 0, // Using total as active for now
          newThisMonth: response.data?.stats?.newUsersThisMonth || 0,
          growth: {
            percentage: 0,
            trend: 'up'
          }
        },
        videos: {
          total: response.data?.stats?.totalVideos || 0,
          completed: response.data?.stats?.totalVideos || 0,
          processing: 0
        },
        posts: {
          total: postsArray.length,
          published: publishedPosts,
          scheduled: 0,
          byPlatform: platformCounts
        },
        media: {
          total: response.data?.stats?.totalMedia || 0,
          active: response.data?.stats?.totalMedia || 0,
          totalStorage: {
            formatted: '0 GB'
          }
        },
        systemHealth: {
          apiResponseTime: response.data?.systemHealth?.api?.responseTime || 0,
          databaseResponseTime: response.data?.systemHealth?.database?.responseTime || 0,
          uptime: response.data?.systemHealth?.server?.uptime || 0,
          connectionStatus: response.data?.systemHealth?.database?.connectionStatus || 'unknown',
          memoryUsage: response.data?.systemHealth?.server?.memoryUsage,
          cpuUsage: response.data?.systemHealth?.server?.cpuUsage
        },
        recentActivity: (response.data?.recent?.users || []).slice(0, 5).map(user => ({
          description: `New user registered: ${user.name}`,
          timestamp: user.createdAt,
          type: 'user_registered'
        }))
      };
      setStats(statsData);
      console.log('Parsed stats:', statsData);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="xl" />
      </div>
    );
  }

  if (!stats || Object.keys(stats).length === 0) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">Dashboard statistics could not be loaded</p>
        <Button variant="primary" onClick={fetchStats}>Retry</Button>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users?.total?.toLocaleString() || '0',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
      subtitle: `${stats.users?.newThisMonth || 0} new this month`,
      iconBg: 'from-violet-500/20 to-purple-500/20',
    },
    {
      title: 'Total Videos',
      value: stats.videos?.total?.toLocaleString() || '0',
      icon: Video,
      gradient: 'from-cyan-500 to-blue-500',
      subtitle: `${stats.videos?.completed?.toLocaleString() || 0} completed`,
      iconBg: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      title: 'Total Posts',
      value: stats.posts?.total?.toLocaleString() || '0',
      icon: FileText,
      gradient: 'from-emerald-500 to-green-500',
      subtitle: `${stats.posts?.published?.toLocaleString() || 0} published`,
      iconBg: 'from-emerald-500/20 to-green-500/20',
    },
    {
      title: 'Total Media',
      value: stats.media?.total?.toLocaleString() || '0',
      icon: ImageIcon,
      gradient: 'from-amber-500 to-orange-500',
      subtitle: stats.media?.totalStorage?.formatted || '0 GB storage',
      iconBg: 'from-amber-500/20 to-orange-500/20',
    },
  ];

  // Prepare chart data from actual API response
  const platformData = stats.posts?.byPlatform && Object.keys(stats.posts.byPlatform).length > 0
    ? Object.entries(stats.posts.byPlatform).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const COLORS = ['#7E29F0', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Dashboard
                </h1>
              </motion.div>
              <p className="text-purple-100 text-lg">
                Welcome back! Here's your overview and system analytics
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-xl"
            >
              <p className="text-sm text-purple-100 mb-1">New Users This Month</p>
              <p className="text-3xl font-bold text-white">
                {stats.users?.newThisMonth || 0}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`} />
            
            {/* Card */}
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Platform Distribution - Only show if data exists */}
        {platformData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts across platforms</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={85}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(126, 41, 240, 0.3)',
                      borderRadius: '12px',
                      padding: '0px 12px 2px 12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    itemStyle={{
                      color: '#1F2937',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                    labelStyle={{
                      color: '#374151',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {platformData.map((platform, index) => (
                  <div key={index} className="text-center">
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[index] }} />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{platform.name}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{platform.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* System Health - Only show real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current system metrics</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">Online</span>
              </div>
            </div>

            <div className="space-y-4">
              {stats.systemHealth?.apiResponseTime > 0 && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">API Response Time</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.systemHealth.apiResponseTime}ms
                    </p>
                  </div>
                </div>
              )}
              
              {stats.systemHealth?.databaseResponseTime > 0 && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">Database Response</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.systemHealth.databaseResponseTime}ms
                    </p>
                  </div>
                </div>
              )}
              
              {stats.systemHealth?.uptime >= 0 && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">System Uptime</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.systemHealth.uptime < 60 
                        ? `${stats.systemHealth.uptime}s`
                        : stats.systemHealth.uptime < 3600
                        ? `${Math.floor(stats.systemHealth.uptime / 60)}m`
                        : stats.systemHealth.uptime < 86400
                        ? `${Math.floor(stats.systemHealth.uptime / 3600)}h`
                        : `${Math.floor(stats.systemHealth.uptime / 86400)}d`
                      }
                    </p>
                  </div>
                </div>
              )}

              {stats.systemHealth?.apiResponseTime === 0 && stats.systemHealth?.databaseResponseTime === 0 && stats.systemHealth?.uptime === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">System metrics unavailable</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest user registrations</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-700 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="primary" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;