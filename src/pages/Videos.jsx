import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Play, 
  Video as VideoIcon,
  Calendar,
  TrendingUp,
  Eye,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  User,
  FileVideo,
  Download,
  Maximize
} from 'lucide-react';
import { videoService } from '../services/videoService';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', status: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    fetchVideos();
  }, [filters.page, filters.status]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await videoService.getAll(cleanFilters);
      setVideos(response.data?.videos || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load videos');
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || video.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await videoService.delete(selectedVideo._id);
      toast.success('Video deleted successfully');
      setDeleteModalOpen(false);
      setSelectedVideo(null);
      fetchVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete video');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate stats
  const stats = {
    total: pagination.total || 0,
    completed: videos.filter(v => v.status === 'completed').length,
    processing: videos.filter(v => v.status === 'processing').length,
    failed: videos.filter(v => v.status === 'failed').length,
    totalSize: videos.reduce((acc, v) => acc + (v.fileSize || 0), 0),
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
              <VideoIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Video Management
            </h1>
          </motion.div>
          <p className="text-purple-100 text-lg">
            Manage and monitor all user-uploaded videos
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
                <VideoIcon size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Videos</h3>
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
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.completed.toLocaleString()}
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
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Processing</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.processing.toLocaleString()}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <HardDrive size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Storage</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatFileSize(stats.totalSize)}
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
                placeholder="Search videos by title, description, or user..."
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
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="uploading">Uploading</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Video count info */}
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredVideos.length} of {videos.length} videos
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl shadow-xl p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#7E29F0]/20"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#7E29F0] absolute inset-0"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-[#7E29F0]/10 to-[#561E97]/10 rounded-3xl mb-4">
              <VideoIcon size={64} className="text-[#7E29F0]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No videos found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {videos.length === 0 
                ? 'No videos available in the database'
                : 'Try adjusting your search filters'
              }
            </p>
          </motion.div>
        ) : (
          <>
            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  
                  {/* Card */}
                  <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-purple-500/20 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-lg">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-900 group-hover:bg-gray-800 transition-colors">
                      <img 
                        src={video.thumbnailUrl || 'https://via.placeholder.com/400x225?text=No+Thumbnail'}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setPreviewModalOpen(true);
                          }}
                          className="p-4 bg-[#7E29F0] rounded-full hover:scale-110 transition-transform shadow-2xl"
                        >
                          <Play size={32} className="text-white fill-white" />
                        </button>
                      </div>
                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {video.status === 'completed' ? (
                          <span className="px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white shadow-lg border border-green-400/20 flex items-center gap-1">
                            <CheckCircle size={10} />
                            Complete
                          </span>
                        ) : video.status === 'processing' ? (
                          <span className="px-2 py-1 bg-orange-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white shadow-lg border border-orange-400/20 flex items-center gap-1">
                            <Clock size={10} />
                            Processing
                          </span>
                        ) : video.status === 'failed' ? (
                          <span className="px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white shadow-lg border border-red-400/20 flex items-center gap-1">
                            <XCircle size={10} />
                            Failed
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white shadow-lg border border-blue-400/20 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {video.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                        {video.title || 'Untitled Video'}
                      </h3>

                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#7E29F0] to-[#561E97] flex items-center justify-center text-white text-xs font-semibold">
                          {video.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {video.user?.name || 'Unknown User'}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 border border-blue-200/20 dark:border-blue-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <HardDrive size={10} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {formatFileSize(video.fileSize)}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-2 border border-purple-200/20 dark:border-purple-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <FileVideo size={10} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">
                            {video.mimeType?.split('/')[1] || 'MP4'}
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2 border border-green-200/20 dark:border-green-700/20">
                          <div className="flex items-center gap-1 mb-1">
                            <Maximize size={10} className="text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {video.dimensions?.width}x{video.dimensions?.height || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Upload Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar size={10} />
                        {new Date(video.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric'
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setPreviewModalOpen(true);
                          }}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium text-xs flex items-center justify-center gap-1"
                        >
                          <Play size={14} />
                          Play
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setDeleteModalOpen(true);
                          }}
                          className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 transition-all duration-300 font-medium text-xs flex items-center justify-center gap-1"
                        >
                          <Trash2 size={14} />
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
                  Showing <span className="text-[#7E29F0] font-bold">{videos.length}</span> of <span className="text-[#7E29F0] font-bold">{pagination.total?.toLocaleString()}</span> videos
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

      {/* Video Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedVideo(null);
        }}
        title="Video Preview"
      >
        <div className="space-y-4">
          {selectedVideo && (
            <>
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video 
                  src={selectedVideo.cloudinaryUrl || selectedVideo.thumbnailUrl}
                  controls
                  className="w-full h-full"
                  poster={selectedVideo.thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedVideo.title}
                </h3>
                
                {selectedVideo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedVideo.description}
                  </p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDuration(selectedVideo.duration)}
                    </p>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">File Size</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatFileSize(selectedVideo.fileSize)}
                    </p>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Resolution</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedVideo.dimensions?.width}x{selectedVideo.dimensions?.height || 'N/A'}
                    </p>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Format</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase">
                      {selectedVideo.mimeType?.split('/')[1] || 'MP4'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
                >
                  Close
                </button>
                {selectedVideo.cloudinaryUrl && (
                  <a
                    href={selectedVideo.cloudinaryUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedVideo(null);
        }}
        title="Delete Video"
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
                  This action <strong>CANNOT be undone</strong>. The video will be permanently deleted from storage.
                </p>
              </div>
            </div>
          </div>

          {/* Video Info */}
          {selectedVideo && (
            <div className="flex gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <img 
                src={selectedVideo.thumbnailUrl || 'https://via.placeholder.com/150'}
                alt={selectedVideo.title}
                className="w-24 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {formatFileSize(selectedVideo.fileSize)} • {formatDuration(selectedVideo.duration)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={10} />
                  {new Date(selectedVideo.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedVideo(null);
              }}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
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
                  Delete Video
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Videos;
