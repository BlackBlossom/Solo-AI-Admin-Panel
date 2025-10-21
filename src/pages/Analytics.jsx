import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, userRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getUserAnalytics(),
      ]);
      // API returns { status, message, data: { overview } } and { data: { userGrowth } }
      setOverview(overviewRes.data?.overview || overviewRes.data || {});
      setUserAnalytics(userRes.data?.userGrowth || userRes.data || {});
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Error fetching analytics:', error);
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

  const platformData = overview?.platformBreakdown
    ? Object.entries(overview.platformBreakdown).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        posts: data.posts,
        views: data.views,
        engagement: data.engagementRate,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Posts', value: overview?.totalPosts?.toLocaleString() || '0', color: 'blue' },
          { label: 'Total Views', value: overview?.totalViews?.toLocaleString() || '0', color: 'green' },
          { label: 'Total Likes', value: overview?.totalLikes?.toLocaleString() || '0', color: 'red' },
          { label: 'Avg Engagement', value: `${overview?.averageEngagementRate || 0}%`, color: 'purple' },
        ].map((metric, index) => (
          <Card key={index} hover>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Platform Performance */}
      <Card title="Platform Performance" subtitle="Posts and views by platform">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="posts" fill="#3B82F6" name="Posts" />
            <Bar yAxisId="right" dataKey="views" fill="#10B981" name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* User Growth */}
      {userAnalytics && (
        <Card title="User Growth" subtitle="New users over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userAnalytics.dailyGrowth?.slice(0, 30) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" name="New Users" />
              <Line type="monotone" dataKey="activeUsers" stroke="#10B981" name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Best Posting Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Best Posting Time" subtitle="Optimal time for engagement">
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-blue-600 mb-2">
              {overview?.timeAnalysis?.bestPostingTime || 'N/A'}
            </p>
            <p className="text-gray-600">Peak engagement hour</p>
          </div>
        </Card>

        <Card title="Best Posting Day" subtitle="Day with highest engagement">
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-purple-600 mb-2">
              {overview?.timeAnalysis?.bestPostingDay || 'N/A'}
            </p>
            <p className="text-gray-600">Best day of the week</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
