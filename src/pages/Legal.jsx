import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Edit,
  Eye,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Hash,
  Globe,
  EyeOff,
  Trash2,
  Plus,
  AlertCircle,
  Shield,
  Info,
  TrendingUp
} from 'lucide-react';
import { legalService } from '../services/legalService';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Legal = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'privacy_policy',
    title: '',
    content: '',
    htmlContent: '',
    isPublished: false
  });

  // Legal content types
  const contentTypes = [
    { value: 'privacy_policy', label: 'Privacy Policy', icon: '🔒', description: 'Data protection and privacy information' },
    { value: 'terms_of_use', label: 'Terms of Use', icon: '📋', description: 'Service terms and conditions' },
    { value: 'faq', label: 'FAQ', icon: '❓', description: 'Frequently asked questions' }
  ];
  
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
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await legalService.getAll();
      setContents(data.message?.contents || []);
    } catch (error) {
      console.error('Error fetching legal contents:', error);
      toast.error('Failed to fetch legal contents');
    } finally {
      setLoading(false);
    }
  };

  // Get content by type
  const getContentByType = (type) => {
    return contents.find(c => c.type === type);
  };

  // Handle view
  const handleView = (type) => {
    const content = getContentByType(type);
    if (content) {
      setSelectedContent(content);
      setIsViewModalOpen(true);
    } else {
      toast.error('Content not found');
    }
  };

  // Handle edit
  const handleEdit = (type) => {
    const content = getContentByType(type);
    if (content) {
      setFormData({
        type: content.type,
        title: content.title,
        content: content.content || '',
        htmlContent: content.htmlContent || '',
        isPublished: content.isPublished
      });
      setSelectedContent(content);
    } else {
      // Creating new content
      const typeInfo = contentTypes.find(t => t.value === type);
      setFormData({
        type: type,
        title: typeInfo?.label || '',
        content: '',
        htmlContent: '',
        isPublished: false
      });
      setSelectedContent(null);
    }
    setIsEditModalOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }
      if (!formData.htmlContent.trim()) {
        toast.error('Content is required');
        return;
      }

      setEditLoading(true);

      if (selectedContent) {
        // Update existing
        await legalService.update(formData.type, {
          title: formData.title,
          content: formData.content,
          htmlContent: formData.htmlContent,
          isPublished: formData.isPublished
        });
        toast.success('Content updated successfully');
      } else {
        // Create new
        await legalService.createOrUpdate(formData);
        toast.success('Content created successfully');
      }

      setIsEditModalOpen(false);
      setFormData({
        type: 'privacy_policy',
        title: '',
        content: '',
        htmlContent: '',
        isPublished: false
      });
      fetchContents();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(error.response?.data?.message || 'Failed to save content');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (type) => {
    try {
      await legalService.togglePublish(type);
      toast.success('Publish status updated');
      fetchContents();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await legalService.delete(selectedContent.type);
      toast.success('Content deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedContent(null);
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error(error.response?.data?.message || 'Failed to delete content');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get stats
  const stats = {
    total: contentTypes.length,
    published: contents.filter(c => c.isPublished).length,
    draft: contents.filter(c => !c.isPublished).length,
    created: contents.length
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
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Legal Content Management
              </h1>
            </div>
            <p className="text-purple-100 text-lg">
              Manage Privacy Policy, Terms of Use, and FAQ content for your application
            </p>
          </motion.div>
        </div>
      </div>

      {/* Statistics Cards */}
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
                <FileText size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Pages</h3>
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
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Globe size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Published</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.published}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Edit size={20} className="text-white" />
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Draft</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.draft}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <CheckCircle size={20} className="text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Created</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.created}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Content Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {contentTypes.map((type, index) => {
          const content = getContentByType(type.value);
          const exists = !!content;

          return (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
              <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{type.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {type.label}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  {exists && (
                    <Badge color={content.isPublished ? 'green' : 'orange'}>
                      {content.isPublished ? (
                        <><Globe size={12} className="mr-1" /> Published</>
                      ) : (
                        <><EyeOff size={12} className="mr-1" /> Draft</>
                      )}
                    </Badge>
                  )}
                </div>

                {/* Content Info */}
                {exists ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Hash size={14} />
                      <span>Version {content.version}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={14} />
                      <span>{formatDate(content.updatedAt)}</span>
                    </div>
                    {content.lastUpdatedBy && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User size={14} />
                        <span>{content.lastUpdatedBy.name}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      No content created yet
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {exists ? (
                    <>
                      <Button
                        onClick={() => handleView(type.value)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleEdit(type.value)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleTogglePublish(type.value)}
                        size="sm"
                        className={`px-3 ${
                          content.isPublished
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                      >
                        {content.isPublished ? <EyeOff size={14} /> : <Globe size={14} />}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleEdit(type.value)}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus size={14} className="mr-1" />
                      Create Content
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span>{selectedContent?.title}</span>
          </div>
        }
      >
        {selectedContent && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge color={selectedContent.isPublished ? 'green' : 'orange'}>
                  {selectedContent.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Version {selectedContent.version}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedContent.type);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(selectedContent.updatedAt)}
                  </p>
                </div>
                {selectedContent.lastUpdatedBy && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Updated By</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedContent.lastUpdatedBy.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Content Preview
              </label>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <iframe
                  title="Legal Content Preview"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          * { box-sizing: border-box; }
                          body {
                            margin: 0;
                            padding: 24px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                            background: #1f2937;
                            color: #d1d5db;
                            line-height: 1.6;
                            font-size: 15px;
                          }
                          h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; color: #f3f4f6; }
                          h2 { font-size: 1.5em; }
                          p { margin: 1em 0; color: #d1d5db; }
                          ul, ol { margin: 1em 0; padding-left: 2em; }
                          li { margin: 0.5em 0; color: #d1d5db; }
                          a { color: #a78bfa; text-decoration: underline; }
                          strong { color: #f9fafb; }
                        </style>
                      </head>
                      <body>
                        ${selectedContent.htmlContent}
                      </body>
                    </html>
                  `}
                  className="w-full border-none"
                  style={{ height: '500px', display: 'block', background: '#1f2937' }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData({
            type: 'privacy_policy',
            title: '',
            content: '',
            htmlContent: '',
            isPublished: false
          });
        }}
        size="lg"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <span>{selectedContent ? 'Edit' : 'Create'} {contentTypes.find(t => t.value === formData.type)?.label}</span>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Info Box */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/20 dark:border-blue-700/20 rounded-xl">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Content Editor</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedContent 
                    ? `Editing will create version ${(selectedContent.version || 0) + 1}. Changes will be saved immediately.`
                    : 'Create new legal content that will be accessible to all app users.'}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <FileText className="w-4 h-4" />
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400"
              placeholder="Enter title"
            />
          </div>

          {/* HTML Content */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <Edit className="w-4 h-4" />
              HTML Content *
            </label>
            <textarea
              value={formData.htmlContent}
              onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
              rows={12}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400 resize-none font-mono text-sm"
              placeholder="<h2>Section Title</h2><p>Your content here...</p>"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Use HTML tags for formatting. Preview available after saving.
            </p>
          </div>

          {/* Plain Text Content (Optional) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
              <FileText className="w-4 h-4" />
              Plain Text Content <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-gray-400 resize-none"
              placeholder="Plain text version for fallback..."
            />
          </div>

          {/* Publish Status */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">Publish Content</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Make this content visible to all app users
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setFormData({
                  type: 'privacy_policy',
                  title: '',
                  content: '',
                  htmlContent: '',
                  isPublished: false
                });
              }}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={editLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {selectedContent ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <span>Delete Legal Content</span>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/20 dark:border-red-700/20 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Are you sure?</p>
                <p className="text-gray-600 dark:text-gray-400">
                  This will permanently delete "{selectedContent?.title}". This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {selectedContent && (
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{contentTypes.find(t => t.value === selectedContent.type)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{selectedContent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge color={selectedContent.isPublished ? 'green' : 'orange'}>
                    {selectedContent.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Legal;
