import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  FileText,
  Send
} from 'lucide-react';
import { postService } from '../services/postService';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', bundleStatus: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const location = useLocation();

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    fetchPosts();
  }, [filters.page, filters.bundleStatus]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await postService.getAll(cleanFilters);
      setPosts(response.data?.posts || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || post.bundleStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    try {
      await postService.delete(selectedPost._id);
      toast.success('Post deleted successfully');
      setDeleteModalOpen(false);
      setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  // Get platform icon
  const getPlatformIcon = (platformName) => {
    const name = platformName?.toLowerCase();
    const iconProps = { size: 20, className: "text-gray-700" };
    
    if (name?.includes('instagram')) return <Instagram {...iconProps} />;
    if (name?.includes('twitter') || name?.includes('x')) return <Twitter {...iconProps} />;
    if (name?.includes('facebook')) return <Facebook {...iconProps} />;
    if (name?.includes('linkedin')) return <Linkedin {...iconProps} />;
    if (name?.includes('youtube')) return <Youtube {...iconProps} />;
    return <Send {...iconProps} />;
  };

  // Calculate stats
  const stats = {
    total: pagination.total || 0,
    published: posts.filter(p => p.bundleStatus === 'posted' || p.bundleStatus === 'published').length,
    scheduled: posts.filter(p => p.bundleStatus === 'scheduled').length,
    draft: posts.filter(p => p.bundleStatus === 'draft').length,
    failed: posts.filter(p => p.bundleStatus === 'failed').length,
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Post Management
            </h1>
          </motion.div>
          <p className="text-purple-100 text-lg">
            Manage and monitor your social media posts across all platforms
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                <FileText size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Posts</h3>
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
                <CheckCircle size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Published</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.published.toLocaleString()}
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
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Clock size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Scheduled</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.scheduled.toLocaleString()}
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
              <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
                <AlertCircle size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Draft</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.draft.toLocaleString()}
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
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <XCircle size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Failed</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.failed.toLocaleString()}
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
                placeholder="Search posts by caption or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="posted">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Post count info */}
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl shadow-xl p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#7E29F0]/20"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#7E29F0] absolute inset-0"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-[#7E29F0]/10 to-[#561E97]/10 rounded-3xl mb-4">
              <FileText size={64} className="text-[#7E29F0]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {posts.length === 0 
                ? 'No posts available in the database'
                : 'Try adjusting your search filters'
              }
            </p>
          </motion.div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  
                  {/* Card */}
                  <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-purple-500/20 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg">
                    {/* Header with User Info and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7E29F0] to-[#561E97] flex items-center justify-center text-white font-semibold shadow-lg">
                          {post.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{post.user?.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{post.user?.email}</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {(post.bundleStatus === 'posted' || post.bundleStatus === 'published') ? (
                        <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-green-400/20 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Published
                        </span>
                      ) : post.bundleStatus === 'scheduled' ? (
                        <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-orange-400/20 flex items-center gap-1">
                          <Clock size={12} />
                          Scheduled
                        </span>
                      ) : post.bundleStatus === 'failed' ? (
                        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-red-400/20 flex items-center gap-1">
                          <XCircle size={12} />
                          Failed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg border border-gray-400/20 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Caption */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {post.caption || 'No caption provided'}
                      </p>
                    </div>

                    {/* Video Thumbnail with Platform Icons on Hover */}
                    {post.video?.thumbnailUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden relative group/thumbnail">
                        <img 
                          src={post.video.thumbnailUrl} 
                          alt="Post thumbnail"
                          className="w-full h-48 object-cover"
                        />
                        {/* Platform Icons Overlay on Hover */}
                        {post.platforms && post.platforms.length > 0 && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            {post.platforms.map((platform, idx) => {
                              const url = post.bundleExternalData?.[platform.name.toUpperCase()]?.permalink;
                              if (!url) return null;
                              
                              return (
                                <button
                                  key={idx}
                                  onClick={() => window.open(url, '_blank')}
                                  className="p-3 bg-white/90 hover:bg-white rounded-full hover:scale-110 transition-all duration-200 shadow-xl cursor-pointer"
                                  title={`View on ${platform.name}`}
                                >
                                  {getPlatformIcon(platform.name)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Platforms */}
                    {post.platforms && post.platforms.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform, idx) => (
                            <div 
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-xs font-medium text-white shadow-lg"
                            >
                              {getPlatformIcon(platform.name)}
                              <span className="capitalize">{platform.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Engagement Stats */}
                    {post.analytics && (
                      <div className="grid grid-cols-4 gap-2 mb-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 border border-blue-200/20 dark:border-blue-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <Eye size={12} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.analytics.views || 0}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-2 border border-pink-200/20 dark:border-pink-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <Heart size={12} className="text-pink-600 dark:text-pink-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.analytics.likes || 0}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-2 border border-purple-200/20 dark:border-purple-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <MessageCircle size={12} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.analytics.comments || 0}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2 border border-green-200/20 dark:border-green-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <Share2 size={12} className="text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.analytics.shares || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Published Date */}
                    {post.publishedAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar size={12} />
                        Published {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setDetailsModalOpen(true);
                        }}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl hover:shadow-lg hover:scale-101 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={16} />
                        Details
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setDeleteModalOpen(true);
                        }}
                        className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
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
                  Showing <span className="text-[#7E29F0] font-bold">{posts.length}</span> of <span className="text-[#7E29F0] font-bold">{pagination.total?.toLocaleString()}</span> posts
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

      {/* Post Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPost(null);
        }}
        title=""
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-6">
            {/* Close Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedPost(null);
                }}
                className="absolute top-0 right-0 z-50 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center mb-6 pr-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7E29F0] to-[#561E97] bg-clip-text text-transparent">
                  Post Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Complete information about this social media post</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              {(selectedPost.bundleStatus === 'posted' || selectedPost.bundleStatus === 'published') ? (
                <span className="px-6 py-2 bg-green-500 rounded-full text-sm font-semibold text-white shadow-lg flex items-center gap-2">
                  <CheckCircle size={16} />
                  Published
                </span>
              ) : selectedPost.bundleStatus === 'scheduled' ? (
                <span className="px-6 py-2 bg-orange-500 rounded-full text-sm font-semibold text-white shadow-lg flex items-center gap-2">
                  <Clock size={16} />
                  Scheduled
                </span>
              ) : selectedPost.bundleStatus === 'failed' ? (
                <span className="px-6 py-2 bg-red-500 rounded-full text-sm font-semibold text-white shadow-lg flex items-center gap-2">
                  <XCircle size={16} />
                  Failed
                </span>
              ) : (
                <span className="px-6 py-2 bg-gray-500 rounded-full text-sm font-semibold text-white shadow-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  Draft
                </span>
              )}
            </div>

            {/* User Information */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7E29F0]/10 to-[#561E97]/10 rounded-2xl blur-2xl"></div>
              <div className="relative flex items-start gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#7E29F0] to-[#561E97] flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  {selectedPost.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedPost.user?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{selectedPost.user?.email}</p>
                  {selectedPost.user?.role && (
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {selectedPost.user.role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Platforms */}
                {selectedPost.platforms && selectedPost.platforms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Publishing Platforms</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedPost.platforms.map((platform, idx) => {
                        const url = selectedPost.bundleExternalData?.[platform.name.toUpperCase()]?.permalink;
                        return (
                          <div 
                            key={idx}
                            className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(platform.name)}
                                <span className="font-semibold text-gray-900 dark:text-white capitalize">{platform.name}</span>
                              </div>
                              {url && (
                                <button
                                  onClick={() => window.open(url, '_blank')}
                                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  title="View on platform"
                                >
                                  <ExternalLink size={16} className="text-gray-600 dark:text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Analytics/Engagement Stats */}
                {selectedPost.analytics && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Engagement Statistics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Eye size={16} className="text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Views</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(selectedPost.analytics.views || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-pink-200/50 dark:border-pink-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-pink-500 rounded-lg">
                            <Heart size={16} className="text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Likes</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(selectedPost.analytics.likes || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <MessageCircle size={16} className="text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Comments</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(selectedPost.analytics.comments || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Share2 size={16} className="text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Shares</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(selectedPost.analytics.shares || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selectedPost.publishedAt && (
                      <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Published At</p>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-purple-600" />
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(selectedPost.publishedAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedPost.createdAt && (
                      <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Created At</p>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-purple-600" />
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(selectedPost.createdAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 max-w-[76.5%] mx-auto">
                {/* Video Thumbnail */}
                {selectedPost.video?.thumbnailUrl && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Thumbnail</h4>
                    <div className="rounded-xl overflow-hidden border-2 border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                      <img 
                        src={selectedPost.video.thumbnailUrl} 
                        alt="Post thumbnail"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Caption - Full width */}
            <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={16} className="text-purple-600" />
                Caption
              </h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedPost.caption || 'No caption provided'}
              </p>
            </div>

            {/* Video Information */}
            {selectedPost.video && (selectedPost.video.title || selectedPost.video.url) && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Video Information</h4>
                <div className="space-y-3">
                  {selectedPost.video.title && (
                    <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Video Title</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPost.video.title}</p>
                    </div>
                  )}

                  {selectedPost.video.url && (
                    <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Video URL</p>
                      <a 
                        href={selectedPost.video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline break-all flex items-center gap-2"
                      >
                        {selectedPost.video.url}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="px-6 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl font-semibold shadow hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Post
              </button>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedPost(null);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] hover:from-[#8E39FF] hover:to-[#6E2EA7] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPost(null);
        }}
        title="Delete Post"
      >
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                  🚨 Warning: Permanent Deletion
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400">
                  This action <strong>CANNOT be undone</strong>. The post will be permanently deleted from the system.
                </p>
              </div>
            </div>
          </div>

          {/* Post Info */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {selectedPost?.caption || 'No caption'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={12} />
              {selectedPost?.publishedAt && new Date(selectedPost.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedPost(null);
              }}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Post
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Posts;
