import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Video, 
  Bell, 
  Shield,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  ArrowUp,
  BarChart3,
  ChevronLeft
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [chartView, setChartView] = useState('year'); // 'year', 'month', 'day'
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  // Ensure selectedYear is valid when stats change
  useEffect(() => {
    const availableYears = stats?.users?.yearsWithUsers || [];
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [stats, selectedYear]);

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

      // Process users data to get monthly breakdown by year
      const usersArray = response.data?.recent?.users || [];
      const usersByYearMonth = {};
      const usersByYearMonthDay = {};
      const usersByYearMonthDayHour = {};
      const yearsWithUsers = new Set();

      usersArray.forEach(user => {
        const date = new Date(user.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        const day = date.getDate(); // 1-31
        const hour = date.getHours(); // 0-23
        
        yearsWithUsers.add(year);
        
        // Track monthly data
        if (!usersByYearMonth[year]) {
          usersByYearMonth[year] = Array(12).fill(0);
        }
        usersByYearMonth[year][month]++;
        
        // Track daily data
        if (!usersByYearMonthDay[year]) {
          usersByYearMonthDay[year] = {};
        }
        if (!usersByYearMonthDay[year][month]) {
          usersByYearMonthDay[year][month] = {};
        }
        if (!usersByYearMonthDay[year][month][day]) {
          usersByYearMonthDay[year][month][day] = 0;
        }
        usersByYearMonthDay[year][month][day]++;
        
        // Track hourly data
        if (!usersByYearMonthDayHour[year]) {
          usersByYearMonthDayHour[year] = {};
        }
        if (!usersByYearMonthDayHour[year][month]) {
          usersByYearMonthDayHour[year][month] = {};
        }
        if (!usersByYearMonthDayHour[year][month][day]) {
          usersByYearMonthDayHour[year][month][day] = {};
        }
        if (!usersByYearMonthDayHour[year][month][day][hour]) {
          usersByYearMonthDayHour[year][month][day][hour] = 0;
        }
        usersByYearMonthDayHour[year][month][day][hour]++;
      });

      const statsData = {
        users: {
          total: response.data?.stats?.totalUsers || 0,
          active: response.data?.stats?.totalUsers || 0, // Using total as active for now
          newThisMonth: response.data?.stats?.newUsersThisMonth || 0,
          growth: {
            percentage: 0,
            trend: 'up'
          },
          byYearMonth: usersByYearMonth,
          byYearMonthDay: usersByYearMonthDay,
          byYearMonthDayHour: usersByYearMonthDayHour,
          yearsWithUsers: Array.from(yearsWithUsers).sort((a, b) => b - a)
        },
        videos: {
          total: response.data?.stats?.totalVideos || 0,
          completed: response.data?.stats?.totalVideos || 0,
          processing: 0
        },
        notifications: {
          total: response.data?.stats?.totalNotificationsSent || 0,
          sent: response.data?.stats?.totalNotificationsSent || 0,
        },
        admins: {
          total: response.data?.stats?.totalAdmins || 0,
          active: response.data?.stats?.totalAdmins || 0,
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
      title: 'Total Notifications',
      value: stats.notifications?.total?.toLocaleString() || '0',
      icon: Bell,
      gradient: 'from-emerald-500 to-green-500',
      subtitle: `${stats.notifications?.sent?.toLocaleString() || 0} sent`,
      iconBg: 'from-emerald-500/20 to-green-500/20',
    },
    {
      title: 'Total Admins',
      value: stats.admins?.total?.toLocaleString() || '0',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
      subtitle: `${stats.admins?.active?.toLocaleString() || 0} active`,
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

  // Get available years (only years with at least 1 user)
  const availableYears = stats?.users?.yearsWithUsers || [];

  // Get chart data for selected year
  const getMonthlyData = (year) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = stats.users?.byYearMonth?.[year] || Array(12).fill(0);
    
    return monthNames.map((month, index) => ({
      month,
      monthIndex: index,
      users: monthlyData[index] || 0
    }));
  };

  // Get day-wise data for a specific month
  const getDailyData = (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dailyDataByDay = stats.users?.byYearMonthDay?.[year]?.[monthIndex] || {};
    
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const users = dailyDataByDay[day] || 0;
      return { day, users };
    });
    return dailyData;
  };

  // Get hourly data for a specific day
  const getHourlyData = (year, monthIndex, day) => {
    const hourlyDataByHour = stats.users?.byYearMonthDayHour?.[year]?.[monthIndex]?.[day] || {};
    
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      const users = hourlyDataByHour[i] || 0;
      return { hour, users };
    });
    return hourlyData;
  };

  // Handle bar click to drill down
  const handleBarClick = (data) => {
    if (chartView === 'year') {
      setSelectedMonth(data.monthIndex);
      setChartView('month');
    } else if (chartView === 'month') {
      setSelectedDay(data.day);
      setChartView('day');
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    if (chartView === 'day') {
      setChartView('month');
      setSelectedDay(null);
    } else if (chartView === 'month') {
      setChartView('year');
      setSelectedMonth(null);
    }
  };

  // Get current chart data based on view
  const getChartData = () => {
    if (chartView === 'year') {
      return getMonthlyData(selectedYear);
    } else if (chartView === 'month') {
      return getDailyData(selectedYear, selectedMonth);
    } else {
      return getHourlyData(selectedYear, selectedMonth, selectedDay);
    }
  };

  // Get chart title based on view
  const getChartTitle = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (chartView === 'year') {
      return `Users Per Month (${selectedYear})`;
    } else if (chartView === 'month') {
      return `Users Per Day (${monthNames[selectedMonth]} ${selectedYear})`;
    } else {
      return `Users Per Hour (${monthNames[selectedMonth]} ${selectedDay}, ${selectedYear})`;
    }
  };

  // Get x-axis key based on view
  const getXAxisKey = () => {
    if (chartView === 'year') return 'month';
    if (chartView === 'month') return 'day';
    return 'hour';
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

        {/* Users Per Month Chart */}
        {availableYears.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {chartView !== 'year' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackClick}
                    className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-purple-200 dark:border-purple-700/50 transition-all duration-300"
                  >
                    <ChevronLeft size={18} />
                  </motion.button>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getChartTitle()}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chartView === 'year' ? 'Monthly user registration trend' : 
                     chartView === 'month' ? 'Click on a day to see hourly data' : 
                     'Hourly user registration data'}
                  </p>
                </div>
              </div>
              {chartView === 'year' && (
                <div className="flex gap-2">
                  {availableYears.map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedYear(year);
                        setChartView('year');
                        setSelectedMonth(null);
                        setSelectedDay(null);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                        selectedYear === year
                          ? 'bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white shadow-lg shadow-purple-500/50'
                          : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-purple-200 dark:border-purple-700/50'
                      }`}
                    >
                      {year}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(126, 41, 240, 0.1)" />
                <XAxis 
                  dataKey={getXAxisKey()} 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid rgba(126, 41, 240, 0.3)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{
                    color: '#7E29F0',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}
                  cursor={{ fill: 'rgba(126, 41, 240, 0.05)' }}
                />
                <Bar 
                  dataKey="users" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                  onClick={handleBarClick}
                  style={{ cursor: chartView !== 'day' ? 'pointer' : 'default' }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7E29F0" stopOpacity={1} />
                    <stop offset="100%" stopColor="#561E97" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
        )}
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