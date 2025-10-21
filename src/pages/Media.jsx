import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Filter, Download, Trash2, Eye, ToggleLeft, ToggleRight, Image, Music, FileType, Sparkles, Film, TrendingUp, Search } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

// Font Preview Component
const FontPreview = ({ previewMedia }) => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Stable font ID using useMemo
  const fontId = useMemo(() => {
    return (previewMedia._id || Math.random().toString(36).substr(2, 9)).replace(/[^a-zA-Z0-9]/g, '');
  }, [previewMedia._id]);
  
  const fontUrl = previewMedia.cloudinaryUrl || previewMedia.secureUrl;
  
  // Determine font format from URL extension or format field
  const urlMatch = fontUrl?.match(/\.(\w+)(?:\?|$)/);
  const extension = urlMatch ? urlMatch[1].toLowerCase() : previewMedia.format?.toLowerCase();
  
  const formatMap = {
    'ttf': 'truetype',
    'otf': 'opentype',
    'woff': 'woff',
    'woff2': 'woff2'
  };
  
  const format = extension ? (formatMap[extension] || extension) : 'ttf';
  const fontFamilyName = `PreviewFont${fontId}`; // Clean name without hyphen
  
  useEffect(() => {
    const loadFont = async () => {
      try {
        console.log('🔄 Loading font:', fontUrl);
        console.log('🔤 Font family name:', fontFamilyName);
        
        const fontFace = new FontFace(
          fontFamilyName,
          `url(${fontUrl})`,
          { style: 'normal', weight: 'normal', display: 'swap' }
        );
        
        await fontFace.load();
        document.fonts.add(fontFace);
        
        setFontLoaded(true);
        console.log('✅ Font loaded successfully');
        
        // Verify it's really available
        const isAvailable = document.fonts.check(`16px ${fontFamilyName}`);
        console.log('✅ Font available check:', isAvailable);
        
        // Log what the browser sees
        setTimeout(() => {
          const testEl = document.querySelector('[data-font-test]');
          if (testEl) {
            const computed = window.getComputedStyle(testEl);
            console.log('✅ Computed font-family:', computed.fontFamily);
          }
        }, 100);
        
      } catch (err) {
        console.error('❌ Font load failed:', err);
        setError(err.message);
      }
    };
    
    loadFont();
    
    return () => {
      document.fonts.forEach((font) => {
        if (font.family === fontFamilyName) {
          document.fonts.delete(font);
          console.log('🗑️ Font removed');
        }
      });
    };
  }, [fontUrl, fontFamilyName]);
  
  return (
    <div className="w-full max-w-4xl max-h-full overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7E29F0]/30 to-[#561E97]/30 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <FileType size={48} className="mx-auto mb-4 text-[#7E29F0] sm:w-12 sm:h-12" />
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 font-sans">
              {previewMedia.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
              Format: {format.toUpperCase()}
            </p>
          </div>
          
          {/* Loading State */}
          {!fontLoaded && !error && (
            <div className="mb-6 flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7E29F0] border-t-transparent"></div>
              <p className="ml-4 text-base text-gray-600 dark:text-gray-400 font-sans">
                Loading font preview...
              </p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-sans font-semibold">
                ❌ Font Load Failed: {error}
              </p>
            </div>
          )}
          
          {/* ✅ FIXED: Font applied directly to each paragraph */}
          <div 
            data-font-test
            className="space-y-4 sm:space-y-6 transition-opacity duration-300"
            style={{ 
              opacity: fontLoaded ? 1 : 0.3
            }}
          >
            <p 
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white text-center"
              style={{ fontFamily: fontLoaded ? fontFamilyName : 'sans-serif' }}
            >
              The quick brown fox
            </p>
            
            <p 
              className="text-2xl sm:text-3xl lg:text-4xl text-gray-700 dark:text-gray-300 text-center"
              style={{ fontFamily: fontLoaded ? fontFamilyName : 'sans-serif' }}
            >
              jumps over the lazy dog
            </p>
            
            <p 
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 text-center"
              style={{ fontFamily: fontLoaded ? fontFamilyName : 'sans-serif' }}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            
            <p 
              className="text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-500 text-center"
              style={{ fontFamily: fontLoaded ? fontFamilyName : 'sans-serif' }}
            >
              abcdefghijklmnopqrstuvwxyz
            </p>
            
            <p 
              className="text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-500 text-center"
              style={{ fontFamily: fontLoaded ? fontFamilyName : 'sans-serif' }}
            >
              0123456789 !@#$%^&*()
            </p>
          </div>
          
          {/* Status Info */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-3">
              {fontLoaded ? (
                <span className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold font-sans">
                  ✅ Font loaded successfully
                </span>
              ) : error ? (
                <span className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold font-sans">
                  ❌ Failed to load font
                </span>
              ) : (
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold font-sans">
                  ⏳ Loading font...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all text-center mb-2">
              Font family: {fontFamilyName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all text-center">
              {fontUrl}
            </p>
          </div> */}
          
          {/* Download Button */}
          {/* <div className="mt-6">
            <a
              href={fontUrl}
              download={previewMedia.title}
              className="block w-full px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl font-semibold text-center hover:shadow-xl hover:scale-105 transition-all duration-300 font-sans"
            >
              <span className="flex items-center justify-center gap-2">
                <Download size={20} />
                Download Font
              </span>
            </a>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
};

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [counts, setCounts] = useState({
    images: 0,
    stickers: 0,
    gifs: 0,
    audio: 0,
    fonts: 0,
    total: 0
  });
  
  // Client-side filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100, // Fetch more items for client-side filtering
    search: '',
    type: '',
    category: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'image',
    category: 'overlay',
    tags: '',
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
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

  // Client-side filtered media
  const filteredMedia = useMemo(() => {
    let filtered = [...media];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus) {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(item => item.isActive === isActive);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type?.toLowerCase() || '';
          bValue = b.type?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [media, searchQuery, selectedType, selectedCategory, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchMedia();
  }, []);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to extract format from mimeType
  const extractFormat = (mimeType, cloudinaryUrl) => {
    if (!mimeType && !cloudinaryUrl) return 'N/A';
    
    // Try to get from URL first
    if (cloudinaryUrl) {
      const match = cloudinaryUrl.match(/\.(\w+)(?:\?|$)/);
      if (match) return match[1].toUpperCase();
    }
    
    // Extract from mimeType
    if (mimeType) {
      const parts = mimeType.split('/');
      if (parts.length === 2) {
        const format = parts[1].replace('octet-stream', 'ttf'); // Handle font files
        return format.toUpperCase();
      }
    }
    
    return 'N/A';
  };

  // Transform API data to include computed properties
  const transformMediaItem = (item) => {
    return {
      ...item,
      // Extract width and height from dimensions object
      width: item.dimensions?.width || 0,
      height: item.dimensions?.height || 0,
      // Format file size
      fileSizeFormatted: formatFileSize(item.fileSize),
      // Format duration
      durationFormatted: formatDuration(item.duration),
      // Extract format
      format: extractFormat(item.mimeType, item.cloudinaryUrl),
      // Add aspect ratio if dimensions exist
      aspectRatio: item.dimensions?.width && item.dimensions?.height 
        ? `${item.dimensions.width}:${item.dimensions.height}`
        : null,
      // Resource type (same as type for now)
      resourceType: item.type
    };
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      // Fetch all media with high limit for client-side filtering
      const response = await mediaService.getAll({ 
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      console.log('Media API Response:', response);
      console.log('Media Items:', response.data?.media);
      console.log('Counts:', response.data?.counts);
      
      // API returns { status, message, data: { media, counts, pagination } }
      // Transform each media item to include computed properties
      const transformedMedia = (response.data?.media || []).map(transformMediaItem);
      
      console.log('Transformed Media Items:', transformedMedia);
      
      setMedia(transformedMedia);
      setCounts(response.data?.counts || { images: 0, stickers: 0, gifs: 0, audio: 0, fonts: 0, total: 0 });
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load media');
      console.error('Error fetching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!uploadData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('type', uploadData.type);
    formData.append('category', uploadData.category);
    
    // Parse tags if provided
    if (uploadData.tags) {
      try {
        // Tags can be comma-separated or JSON array
        const tagsArray = uploadData.tags.includes(',') 
          ? uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : JSON.parse(uploadData.tags);
        formData.append('tags', JSON.stringify(tagsArray));
      } catch (error) {
        // If parsing fails, send as is
        formData.append('tags', uploadData.tags);
      }
    }

    try {
      const response = await mediaService.upload(formData);
      toast.success(response.message || 'Media uploaded successfully');
      setUploadModalOpen(false);
      fetchMedia();
      setSelectedFile(null);
      setUploadData({
        title: '',
        description: '',
        type: 'image',
        category: 'overlay',
        tags: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      console.error('Upload error:', error.response?.data);
    }
  };

  const handleToggleStatus = async (id, currentTitle) => {
    try {
      const response = await mediaService.toggleStatus(id);
      toast.success(response.message || 'Status updated successfully');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Toggle status error:', error);
    }
  };

  const handleDelete = (id, title) => {
    setMediaToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    
    try {
      const response = await mediaService.delete(mediaToDelete.id);
      toast.success(response.message || 'Media deleted successfully');
      setDeleteModalOpen(false);
      setMediaToDelete(null);
      setMetadataModalOpen(false); // Close metadata modal if open
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete media');
      console.error('Delete error:', error);
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      image: <Image size={16} className="inline" />,
      sticker: <Sparkles size={16} className="inline" />,
      gif: <Film size={16} className="inline" />,
      audio: <Music size={16} className="inline" />,
      font: <FileType size={16} className="inline" />
    };
    return iconMap[type] || <Image size={16} className="inline" />;
  };

  const getTypeBadgeColor = (type) => {
    const colorMap = {
      image: 'primary',
      sticker: 'warning',
      gif: 'info',
      audio: 'success',
      font: 'secondary'
    };
    return colorMap[type] || 'primary';
  };

  const handlePreview = (mediaItem) => {
    setPreviewMedia(mediaItem);
    setPreviewModalOpen(true);
  };

  const handleViewMetadata = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setMetadataModalOpen(true);
  };

  const renderMediaThumbnail = (mediaItem, size = 'medium') => {
    const sizeClasses = {
      small: 'h-12 w-12',
      medium: 'h-full w-full',
      large: 'h-96 w-full'
    };

    // For audio, show icon
    if (mediaItem.type === 'audio') {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center`}>
          <Music size={size === 'large' ? 64 : size === 'medium' ? 48 : 24} className="text-white" />
          {size === 'large' && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
              <p className="font-semibold">{mediaItem.title}</p>
              <p className="text-sm">Duration: {mediaItem.durationFormatted || 'N/A'}</p>
            </div>
          )}
        </div>
      );
    }

    // For fonts, show preview with the actual font
    if (mediaItem.type === 'font') {
      const fontId = (mediaItem._id || Math.random().toString(36).substr(2, 9)).replace(/[^a-zA-Z0-9]/g, '');
      const fontUrl = mediaItem.cloudinaryUrl || mediaItem.secureUrl;
      
      // Determine font format from URL extension or format field
      let fontFormat = 'truetype'; // default
      
      // Try to get format from URL extension first
      const urlMatch = fontUrl?.match(/\.(\w+)(?:\?|$)/);
      const extension = urlMatch ? urlMatch[1].toLowerCase() : mediaItem.format?.toLowerCase();
      
      if (extension) {
        const formatMap = {
          'ttf': 'truetype',
          'otf': 'opentype',
          'woff': 'woff',
          'woff2': 'woff2'
        };
        fontFormat = formatMap[extension] || 'truetype';
      }
      
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg flex flex-col items-center justify-center overflow-hidden relative`}>
          <style>
            {`
              @font-face {
                font-family: 'Font${fontId}';
                src: url('${fontUrl}') format('${fontFormat}');
                font-display: swap;
              }
              .font-preview-${fontId} {
                font-family: 'Font${fontId}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }
            `}
          </style>
          <div className={`font-preview-${fontId} text-center p-4 transition-all duration-300`}>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Aa</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">{mediaItem.title}</p>
          </div>
          {size === 'large' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
              <p className="font-semibold text-sm font-sans">{mediaItem.title}</p>
              <p className="text-xs opacity-80 font-sans">Format: {mediaItem.format?.toUpperCase()}</p>
            </div>
          )}
        </div>
      );
    }

    // For images, stickers, gifs
    return (
      <img 
        src={mediaItem.thumbnailUrl || mediaItem.cloudinaryUrl || mediaItem.secureUrl} 
        alt={mediaItem.title}
        className={`${sizeClasses[size]} object-cover rounded-lg`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/400?text=No+Image';
        }}
      />
    );
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
                  <Image className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Media Library
                </h1>
              </motion.div>
              <p className="text-purple-100 text-lg">
                Manage and organize your creative assets
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => setUploadModalOpen(true)}
                className="group relative px-8 py-4 bg-white hover:bg-gray-50 text-[#7E29F0] rounded-2xl font-semibold shadow-2xl shadow-purple-900/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <Upload className="w-5 h-5" />
                Upload Media
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Glassmorphism Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Image size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Images</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.images?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Stickers</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.stickers?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-[#7E29F0] to-[#561E97] rounded-xl shadow-lg">
                <Film size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">GIFs</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.gifs?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Music size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Audio</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.audio?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                <FileType size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Fonts</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.fonts?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-[#7E29F0] to-[#190830] rounded-xl shadow-lg">
                <Upload size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Assets</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {counts.total?.toLocaleString() || 0}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="image">Image</option>
              <option value="sticker">Sticker</option>
              <option value="gif">GIF</option>
              <option value="audio">Audio</option>
              <option value="font">Font</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="overlay">Overlay</option>
              <option value="effect">Effect</option>
              <option value="transition">Transition</option>
              <option value="music">Music</option>
              <option value="soundfx">Sound FX</option>
              <option value="filter">Filter</option>
              <option value="background">Background</option>
              <option value="template">Template</option>
              <option value="typography">Typography</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-purple-200/50 dark:border-purple-700/50">
          {/* Sort By */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Order:</label>
            <div className="flex gap-2">
              {[
                { value: 'desc', label: 'Descending' },
                { value: 'asc', label: 'Ascending' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortOrder(option.value)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    sortOrder === option.value
                      ? 'bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Table/Grid */}
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl shadow-xl p-6">
          {/* Media Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#7E29F0]/20"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#7E29F0] absolute inset-0"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading media...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-[#7E29F0]/10 to-[#561E97]/10 rounded-3xl mb-4">
                <Upload size={64} className="text-[#7E29F0]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {media.length === 0 ? 'No media found' : 'No matching media'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {media.length === 0 
                  ? 'Upload your first media to get started' 
                  : 'Try adjusting your filters to see more results'}
              </p>
              {media.length === 0 && (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Upload Your First Media
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7E29F0]/20 to-[#561E97]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  
                  {/* Card */}
                  <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Thumbnail */}
                    <div 
                      className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer overflow-hidden"
                      onClick={() => handlePreview(item)}
                    >
                      {renderMediaThumbnail(item, 'medium')}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(item);
                            }}
                            className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                            title="Preview"
                          >
                            <Eye size={20} className="text-[#7E29F0]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.cloudinaryUrl || item.secureUrl, '_blank');
                            }}
                            className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                            title="Download"
                          >
                            <Download size={20} className="text-[#7E29F0]" />
                          </button>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#7E29F0] shadow-lg border border-white/20">
                          {item.type}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold shadow-lg border border-white/20 ${
                          item.isActive 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-gray-500/90 text-white'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div 
                        className="cursor-pointer mb-4"
                        onClick={() => handleViewMetadata(item)}
                      >
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 hover:text-[#7E29F0] transition-colors text-lg">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center text-gray-500 gap-2">
                          {getTypeIcon(item.type)}
                          <span className="text-xs uppercase font-mono font-semibold text-gray-600 dark:text-gray-400">{item.format}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{item.fileSizeFormatted || 'N/A'}</span>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {item.type === 'audio' ? (
                            <>⏱️ {item.durationFormatted || 'N/A'}</>
                          ) : item.width && item.height ? (
                            <>📏 {item.width}×{item.height}</>
                          ) : (
                            <>—</>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          <span>👁️ {item.usageCount || 0}</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#7E29F0]/10 to-[#561E97]/10 text-[#7E29F0] rounded-lg text-xs font-semibold border border-[#7E29F0]/20">
                          {item.category}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewMetadata(item)}
                          className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item._id, item.title)}
                          className="px-3 py-2.5 text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all duration-300"
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {item.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.title)}
                          className="px-3 py-2.5 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 transition-all duration-300"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {pagination.total > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Showing <span className="text-[#7E29F0] font-bold">{filteredMedia.length}</span> of <span className="text-[#7E29F0] font-bold">{media.length}</span> media files
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
      </div>

      {/* Preview Modal - Minimalist Full Screen */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewMedia(null);
        }}
        title=""
        size="full"
      >
        {previewMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full flex flex-col bg-black/95 overflow-hidden"
          >
            {/* Close Button - Top Right */}
            <button
              onClick={() => {
                setPreviewModalOpen(false);
                setPreviewMedia(null);
              }}
              className="absolute top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main Preview Area - Centered */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              {previewMedia.type === 'audio' ? (
                <div className="w-full max-w-2xl max-h-full overflow-y-auto">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                  >
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-3xl blur-3xl"></div>
                    
                    {/* Audio Card */}
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 sm:p-12 shadow-2xl">
                      <div className="text-center text-white mb-6 sm:mb-8">
                        <Music size={60} className="mx-auto mb-4 sm:mb-6 drop-shadow-lg sm:w-20 sm:h-20" />
                        <h3 className="text-2xl sm:text-3xl font-bold mb-2">{previewMedia.title}</h3>
                      </div>
                      
                      {previewMedia.cloudinaryUrl && (
                        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
                          <audio 
                            controls 
                            className="w-full"
                            style={{ outline: 'none' }}
                            autoPlay
                          >
                            <source src={previewMedia.cloudinaryUrl} type={`audio/${previewMedia.format || 'mpeg'}`} />
                            <source src={previewMedia.secureUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ) : previewMedia.type === 'font' ? (
                <FontPreview previewMedia={previewMedia} />
              ) : (
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  src={previewMedia.cloudinaryUrl || previewMedia.secureUrl}
                  alt={previewMedia.title}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800?text=Image+Not+Available';
                  }}
                />
              )}
            </div>

            {/* Bottom Info Bar - Glassmorphic */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative border-t border-white/10 flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-2xl"></div>
              
              <div className="relative px-4 sm:px-8 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
                  {/* Left - Title & Type */}
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{previewMedia.title}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 flex-wrap">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full font-medium">
                          {previewMedia.type}
                        </span>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full font-mono">
                          {previewMedia.format?.toUpperCase()}
                        </span>
                        {previewMedia.type === 'audio' ? (
                          <span>{previewMedia.durationFormatted || 'N/A'}</span>
                        ) : previewMedia.width && previewMedia.height ? (
                          <span>{previewMedia.width}×{previewMedia.height}</span>
                        ) : null}
                        <span>{previewMedia.fileSizeFormatted || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                      onClick={() => window.open(previewMedia.cloudinaryUrl || previewMedia.secureUrl, '_blank')}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    <button
                      onClick={() => {
                        setPreviewModalOpen(false);
                        handleViewMetadata(previewMedia);
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] hover:from-[#8E39FF] hover:to-[#6E2EA7] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm whitespace-nowrap"
                    >
                      Full Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Modal>

      {/* Metadata Modal - Modern Design */}
      <Modal
        isOpen={metadataModalOpen}
        onClose={() => {
          setMetadataModalOpen(false);
          setSelectedMedia(null);
        }}
        title=""
        size="lg"
      >
        {selectedMedia && (
          <div className="space-y-6">
            {/* Close Button & Title Header */}
            <div className="relative">
              <button
                onClick={() => {
                  setMetadataModalOpen(false);
                  setSelectedMedia(null);
                }}
                className="absolute top-0 right-0 z-50 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center mb-6 pr-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7E29F0] to-[#561E97] bg-clip-text text-transparent">
                  Media Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Complete information about this media asset</p>
              </div>
            </div>

            {/* Header Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7E29F0]/10 to-[#561E97]/10 rounded-2xl blur-2xl"></div>
              <div className="relative flex items-start gap-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-lg">
                  {renderMediaThumbnail(selectedMedia, 'medium')}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#7E29F0] to-[#561E97] bg-clip-text text-transparent mb-2">
                    {selectedMedia.title}
                  </h3>
                  {selectedMedia.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedMedia.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#7E29F0] to-[#561E97] text-white rounded-full text-xs font-semibold">
                      {selectedMedia.type}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {selectedMedia.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedMedia.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {selectedMedia.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Basic Information</h4>
                
                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Media ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{selectedMedia._id}</p>
                </div>

                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Format & Size</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-gray-100 uppercase">{selectedMedia.format}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedMedia.fileSizeFormatted || 'N/A'}</p>
                </div>

                {selectedMedia.width && selectedMedia.height && (
                  <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Dimensions</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedMedia.width} × {selectedMedia.height}</p>
                    {selectedMedia.aspectRatio && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ratio: {selectedMedia.aspectRatio}</p>
                    )}
                  </div>
                )}

                {selectedMedia.type === 'audio' && selectedMedia.duration && (
                  <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Duration</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedMedia.durationFormatted || 'N/A'}</p>
                  </div>
                )}
              </div>

              {/* Technical Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Technical Details</h4>

                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Resource Type</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{selectedMedia.resourceType}</p>
                </div>

                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Cloudinary Folder</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedMedia.cloudinaryFolder}</p>
                </div>

                {selectedMedia.type === 'audio' && (
                  <>
                    {selectedMedia.bitrate && (
                      <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Bitrate</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{(selectedMedia.bitrate / 1000).toFixed(0)} kbps</p>
                      </div>
                    )}

                    {selectedMedia.sampleRate && (
                      <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Sample Rate</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{(selectedMedia.sampleRate / 1000).toFixed(1)} kHz</p>
                      </div>
                    )}
                  </>
                )}

                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Timestamps</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Created: {new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Updated: {new Date(selectedMedia.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30 dark:border-blue-700/30">
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">Usage Statistics</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Total Uses</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedMedia.usageCount || 0}</p>
                  </div>
                  {selectedMedia.lastUsedAt && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Last Used</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {new Date(selectedMedia.lastUsedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {selectedMedia.tags && selectedMedia.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMedia.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-300/50 dark:border-gray-600/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* URLs */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Cloudinary URL</h4>
              <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <a 
                  href={selectedMedia.cloudinaryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#7E29F0] hover:text-[#561E97] break-all transition-colors"
                >
                  {selectedMedia.cloudinaryUrl}
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => {
                  setMetadataModalOpen(false);
                  handlePreview(selectedMedia);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                onClick={() => window.open(selectedMedia.cloudinaryUrl || selectedMedia.secureUrl, '_blank')}
                className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(selectedMedia._id, selectedMedia.title);
                  setMetadataModalOpen(false);
                }}
                className={`px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg hover:scale-105 transition-all duration-300 ${
                  selectedMedia.isActive
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                    : 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                }`}
              >
                {selectedMedia.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMedia._id, selectedMedia.title);
                  setMetadataModalOpen(false);
                }}
                className="px-6 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl font-semibold shadow hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal - Modern Design */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedFile(null);
          setUploadData({
            title: '',
            description: '',
            type: 'image',
            category: 'overlay',
            tags: '',
          });
        }}
        title=""
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow hover:shadow-lg transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] hover:from-[#8E39FF] hover:to-[#6E2EA7] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Upload Media
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-[#7E29F0]/10 to-[#561E97]/10 rounded-2xl mb-4">
              <Upload size={40} className="text-[#7E29F0]" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#7E29F0] to-[#561E97] bg-clip-text text-transparent mb-2">
              Upload New Media
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Add images, stickers, GIFs, audio, or fonts to your library</p>
          </div>

          {/* File Input - Drag & Drop Style */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7E29F0]/5 to-[#561E97]/5 rounded-2xl blur-xl"></div>
            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                File <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept="image/*,audio/*,.gif,.ttf,.otf,.woff,.woff2"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-[#7E29F0] hover:bg-[#7E29F0]/5 transition-all duration-300 group-hover:scale-[1.02]">
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-block p-3 bg-[#7E29F0]/10 rounded-xl">
                        <Upload size={32} className="text-[#7E29F0]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Max file size: 50MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              placeholder="Enter a descriptive title"
              maxLength={100}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#7E29F0] focus:border-[#7E29F0] backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {uploadData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              placeholder="Add a description (optional)"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#7E29F0] focus:border-[#7E29F0] backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {uploadData.description.length}/500 characters
            </p>
          </div>

          {/* Type & Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#7E29F0] focus:border-[#7E29F0] backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100"
              >
                <option value="image">🖼️ Image</option>
                <option value="sticker">✨ Sticker</option>
                <option value="gif">🎬 GIF</option>
                <option value="audio">🎵 Audio</option>
                <option value="font">🔤 Font</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#7E29F0] focus:border-[#7E29F0] backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100"
              >
                <option value="overlay">Overlay</option>
                <option value="effect">Effect</option>
                <option value="transition">Transition</option>
                <option value="music">Music</option>
                <option value="soundfx">Sound FX</option>
                <option value="filter">Filter</option>
                <option value="background">Background</option>
                <option value="template">Template</option>
                <option value="typography">Typography</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
              Tags
            </label>
            <input
              type="text"
              value={uploadData.tags}
              onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
              placeholder="sunset, tropical, warm, colorful..."
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#7E29F0] focus:border-[#7E29F0] backdrop-blur-sm transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Separate multiple tags with commas for better organization
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMediaToDelete(null);
        }}
        title="Confirm Deletion"
      >
        {mediaToDelete && (
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                    ⚠️ Permanent Deletion Warning
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    This action cannot be undone. The media will be permanently deleted from both the database and Cloudinary storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Media Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                You are about to delete:
              </h5>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                "{mediaToDelete.title}"
              </p>
            </div>

            {/* Consequences */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                What will happen:
              </h5>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Media will be removed from your library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>File will be deleted from Cloudinary storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Any projects using this media may be affected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>This action is irreversible</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setMediaToDelete(null);
                }}
                className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Permanently
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Media;
