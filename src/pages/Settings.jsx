import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { settingsService } from '../services/settingsService';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { 
  Save, 
  Settings as SettingsIcon, 
  Mail, 
  Cloud, 
  Video, 
  Globe, 
  Zap,
  Shield,
  Key,
  Server,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('app');
  const [disclosure, setDisclosure] = useState('masked'); // public, masked, full - default to masked
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    fetchSettings();
  }, [disclosure]);

  // Update tab indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = document.querySelector(`[data-tab="${activeTab}"]`);
      const parent = activeButton?.parentElement;
      
      if (activeButton && parent) {
        const buttonRect = activeButton.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        
        setTabIndicator({
          left: buttonRect.left - parentRect.left,
          top: buttonRect.top - parentRect.top,
          width: buttonRect.width,
          height: buttonRect.height
        });
      }
    };
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateIndicator, 10);
    
    // Update on window resize
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.get(disclosure);
      const settingsData = response.data?.settings || response.data || {};
      setSettings(settingsData);
      setFormData(settingsData);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to deeply compare two objects and return only changed values
  const getChangedValues = (original, updated) => {
    const changes = {};

    const compareObjects = (orig, upd, path = '') => {
      const result = {};
      let hasChanges = false;

      for (const key in upd) {
        const origValue = orig?.[key];
        const updValue = upd[key];

        // Skip if values are the same
        if (JSON.stringify(origValue) === JSON.stringify(updValue)) {
          continue;
        }

        // If the value is an object (but not null or array), recurse
        if (updValue && typeof updValue === 'object' && !Array.isArray(updValue)) {
          const nestedChanges = compareObjects(origValue || {}, updValue, `${path}${key}.`);
          if (Object.keys(nestedChanges).length > 0) {
            result[key] = nestedChanges;
            hasChanges = true;
          }
        } else {
          // Value has changed
          result[key] = updValue;
          hasChanges = true;
        }
      }

      return hasChanges ? result : {};
    };

    return compareObjects(original, updated);
  };

  const handleSaveClick = () => {
    // Get only the changed values
    const changedValues = getChangedValues(settings, formData);

    // If no changes detected
    if (Object.keys(changedValues).length === 0) {
      toast('No changes detected', {
        icon: 'ℹ️',
      });
      return;
    }

    // Prepare data to send
    let dataToSend = { ...changedValues };
    
    if (disclosure === 'masked' || disclosure === 'public') {
      // Helper function to check if a value is masked
      const isMaskedValue = (value) => {
        return typeof value === 'string' && value.includes('••');
      };

      // Recursively remove masked values from the object
      const removeMaskedValues = (obj) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const cleanedNested = removeMaskedValues(value);
            if (Object.keys(cleanedNested).length > 0) {
              cleaned[key] = cleanedNested;
            }
          } else if (!isMaskedValue(value)) {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      dataToSend = removeMaskedValues(changedValues);
    }

    // Check again if there are any changes after filtering masked values
    if (Object.keys(dataToSend).length === 0) {
      toast('No changes to update. Masked values require Full disclosure mode to edit.', {
        icon: '🔒',
      });
      return;
    }

    // Store pending changes and open confirmation modal
    setPendingChanges(dataToSend);
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await settingsService.update(pendingChanges);
      toast.success('Settings updated successfully');
      setConfirmModalOpen(false);
      setPendingChanges(null);
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'app', label: 'Application', icon: SettingsIcon },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'cloudinary', label: 'Cloudinary', icon: Cloud },
    { id: 'mongodb', label: 'Database', icon: Server },
    { id: 'video', label: 'Video Upload', icon: Video },
    { id: 'urls', label: 'URLs', icon: Globe },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  if (loading) {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  System Settings
                </h1>
              </motion.div>
              <p className="text-purple-100 text-lg mb-4">
                Configure and manage your application settings
              </p>
              
              {/* Disclosure Level Selector */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-xl p-2 w-fit border border-white/20">
                <Shield className="w-4 h-4 text-white ml-2" />
                <span className="text-sm text-white/80 font-medium">Disclosure:</span>
                {['public', 'masked', 'full'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDisclosure(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      disclosure === level
                        ? 'bg-white text-[#7E29F0]'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className="group relative px-8 py-4 bg-white hover:bg-gray-50 text-[#7E29F0] rounded-2xl font-semibold shadow-2xl shadow-purple-900/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-2xl p-2 shadow-xl">
          <div className="flex flex-wrap gap-2 relative">
            {/* Animated background indicator - always present */}
            <motion.div
              className="absolute bg-gradient-to-r from-[#7E29F0] to-[#561E97] rounded-xl shadow-lg shadow-purple-500/50 pointer-events-none"
              animate={{
                left: tabIndicator.left,
                top: tabIndicator.top,
                width: tabIndicator.width,
                height: tabIndicator.height
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 35,
                mass: 0.8
              }}
              style={{ willChange: 'transform, width, height' }}
            />
            
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 group"
                >
                  {/* Icon and text */}
                  <Icon className={`w-4 h-4 relative z-10 transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                  }`} />
                  <span className={`relative z-10 transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclosure Warning */}
      {disclosure !== 'full' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                {disclosure === 'public' ? 'Public Mode' : 'Masked Mode'}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {disclosure === 'public' 
                  ? 'Sensitive credentials are hidden for security. Switch to "Full" disclosure to view/edit them.'
                  : 'Sensitive credentials are partially masked. Switch to "Full" disclosure to view complete values.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {disclosure === 'full' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                ⚠️ Full Disclosure Mode Active
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400">
                All sensitive credentials including API keys and passwords are visible. Handle with extreme care.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'app' && (
          <SettingsSection title="Application Settings" icon={SettingsIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Application Name"
                value={formData.app?.name || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    app: { ...formData.app, name: e.target.value },
                  })
                }
                placeholder="Enter application name"
              />
              
              <InputField
                label="Description"
                value={formData.app?.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    app: { ...formData.app, description: e.target.value },
                  })
                }
                placeholder="Enter description"
              />

              <InputField
                label="Support Email"
                type="email"
                value={formData.app?.supportEmail || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    app: { ...formData.app, supportEmail: e.target.value },
                  })
                }
                placeholder="support@example.com"
              />

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToggleField
                    label="Maintenance Mode"
                    description="Enable to put the app in maintenance mode"
                    checked={formData.app?.maintenanceMode || false}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        app: { ...formData.app, maintenanceMode: checked },
                      })
                    }
                  />

                  <ToggleField
                    label="Allow New Registrations"
                    description="Allow new users to register"
                    checked={formData.app?.allowNewRegistrations !== false}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        app: { ...formData.app, allowNewRegistrations: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <SettingsSection title="Email Provider" icon={Mail}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Provider
                </label>
                <div className="flex gap-4">
                  {['resend', 'smtp'].map((provider) => (
                    <button
                      key={provider}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          email: { ...formData.email, provider },
                        })
                      }
                      className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all text-white duration-300 ${
                        formData.email?.provider === provider
                          ? 'border-[#7E29F0] bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.email?.provider === provider
                              ? 'border-[#7E29F0] bg-[#7E29F0]'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.email?.provider === provider && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium capitalize">{provider}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {formData.email?.provider === 'resend' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(disclosure === 'masked' || disclosure === 'full') && (
                    <div className="md:col-span-2">
                      <InputField
                        label="API Key"
                        type={disclosure === 'full' ? 'text' : 'password'}
                        value={formData.email?.resend?.apiKey || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: {
                              ...formData.email,
                              resend: { ...formData.email?.resend, apiKey: e.target.value },
                            },
                          })
                        }
                        placeholder="re_xxxxxxxxxxxx"
                      />
                    </div>
                  )}
                  {disclosure === 'public' && (
                    <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        🔒 API Key is hidden in public mode
                      </p>
                    </div>
                  )}
                  <InputField
                    label="From Email"
                    type="email"
                    value={formData.email?.resend?.fromEmail || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          resend: { ...formData.email?.resend, fromEmail: e.target.value },
                        },
                      })
                    }
                    placeholder="noreply@example.com"
                  />
                  <InputField
                    label="From Name"
                    value={formData.email?.resend?.fromName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          resend: { ...formData.email?.resend, fromName: e.target.value },
                        },
                      })
                    }
                    placeholder="Your App Name"
                  />
                </div>
              )}

              {formData.email?.provider === 'smtp' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="SMTP Host"
                    value={formData.email?.smtp?.host || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          smtp: { ...formData.email?.smtp, host: e.target.value },
                        },
                      })
                    }
                    placeholder="smtp.gmail.com"
                  />
                  <InputField
                    label="SMTP Port"
                    type="number"
                    value={formData.email?.smtp?.port || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          smtp: { ...formData.email?.smtp, port: parseInt(e.target.value) },
                        },
                      })
                    }
                    placeholder="587"
                  />
                  <InputField
                    label="SMTP User"
                    value={formData.email?.smtp?.user || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          smtp: { ...formData.email?.smtp, user: e.target.value },
                        },
                      })
                    }
                    placeholder="user@gmail.com"
                  />
                  {(disclosure === 'masked' || disclosure === 'full') && formData.email?.smtp?.pass && (
                    <InputField
                      label="SMTP Password"
                      type={disclosure === 'full' ? 'text' : 'password'}
                      value={formData.email?.smtp?.pass || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: {
                            ...formData.email,
                            smtp: { ...formData.email?.smtp, pass: e.target.value },
                          },
                        })
                      }
                      placeholder="••••••••"
                    />
                  )}
                  {disclosure === 'public' && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        🔒 Password hidden
                      </p>
                    </div>
                  )}
                  <InputField
                    label="From Email"
                    type="email"
                    value={formData.email?.smtp?.fromEmail || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          smtp: { ...formData.email?.smtp, fromEmail: e.target.value },
                        },
                      })
                    }
                    placeholder="noreply@example.com"
                  />
                  <InputField
                    label="From Name"
                    value={formData.email?.smtp?.fromName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          smtp: { ...formData.email?.smtp, fromName: e.target.value },
                        },
                      })
                    }
                    placeholder="Your App Name"
                  />
                  <ToggleField
                    label="Secure Connection"
                    description="Use SSL/TLS"
                    checked={formData.email?.smtp?.secure || false}
                    onChange={(checked) =>
                      setFormData({
                        ...formData,
                        email: {
                          ...formData.email,
                          smtp: { ...formData.email?.smtp, secure: checked },
                        },
                      })
                    }
                  />
                </div>
              )}
            </SettingsSection>
          </div>
        )}

        {activeTab === 'cloudinary' && (
          <SettingsSection title="Cloudinary Settings" icon={Cloud}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Cloud Name"
                value={formData.cloudinary?.cloudName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cloudinary: { ...formData.cloudinary, cloudName: e.target.value },
                  })
                }
                placeholder="your-cloud-name"
              />
              <InputField
                label="API Key"
                value={formData.cloudinary?.apiKey || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cloudinary: { ...formData.cloudinary, apiKey: e.target.value },
                  })
                }
                placeholder="123456789012345"
              />
              {(disclosure === 'masked' || disclosure === 'full') && formData.cloudinary?.apiSecret && (
                <div className="md:col-span-2">
                  <InputField
                    label="API Secret"
                    type={disclosure === 'full' ? 'text' : 'password'}
                    value={formData.cloudinary?.apiSecret || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cloudinary: { ...formData.cloudinary, apiSecret: e.target.value },
                      })
                    }
                    placeholder="API Secret"
                  />
                </div>
              )}
              {disclosure === 'public' && (
                <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    🔒 API Secret is hidden in public mode
                  </p>
                </div>
              )}
            </div>
          </SettingsSection>
        )}

        {activeTab === 'mongodb' && (
          <SettingsSection title="Database Configuration" icon={Server}>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                      Security Notice
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      Database credentials are highly sensitive. Only modify if you know what you're doing.
                    </p>
                  </div>
                </div>
              </div>
              
              {(disclosure === 'masked' || disclosure === 'full') && formData.mongodb?.uri && (
                <InputField
                  label="MongoDB URI"
                  type={disclosure === 'full' ? 'text' : 'password'}
                  value={formData.mongodb?.uri || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mongodb: { ...formData.mongodb, uri: e.target.value },
                    })
                  }
                  placeholder="mongodb://username:password@host:port/database"
                />
              )}
              
              {disclosure === 'public' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    🔒 Database URI is hidden in public mode
                  </p>
                </div>
              )}
            </div>
          </SettingsSection>
        )}

        {activeTab === 'video' && (
          <SettingsSection title="Video Upload Settings" icon={Video}>
            <div className="space-y-6">
              <InputField
                label="Max File Size (MB)"
                type="number"
                value={formData.videoUpload?.maxFileSize || 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videoUpload: {
                      ...formData.videoUpload,
                      maxFileSize: parseInt(e.target.value),
                    },
                  })
                }
                placeholder="100"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Allowed Formats
                </label>
                <div className="flex flex-wrap gap-3">
                  {(formData.videoUpload?.allowedFormats || []).map((format, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-xl flex items-center gap-2"
                    >
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {format}
                      </span>
                      <button
                        onClick={() => {
                          const newFormats = formData.videoUpload.allowedFormats.filter(
                            (_, i) => i !== index
                          );
                          setFormData({
                            ...formData,
                            videoUpload: {
                              ...formData.videoUpload,
                              allowedFormats: newFormats,
                            },
                          });
                        }}
                        className="text-purple-400 hover:text-purple-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <InputField
                label="Upload Path"
                value={formData.videoUpload?.uploadPath || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videoUpload: {
                      ...formData.videoUpload,
                      uploadPath: e.target.value,
                    },
                  })
                }
                placeholder="./uploads/videos"
              />
            </div>
          </SettingsSection>
        )}

        {activeTab === 'urls' && (
          <SettingsSection title="URL Configuration" icon={Globe}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Production URL"
                value={formData.urls?.productionUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urls: { ...formData.urls, productionUrl: e.target.value },
                  })
                }
                placeholder="https://api.example.com"
              />
              <InputField
                label="Frontend URL"
                value={formData.urls?.frontendUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    urls: { ...formData.urls, frontendUrl: e.target.value },
                  })
                }
                placeholder="https://app.example.com"
              />
            </div>
          </SettingsSection>
        )}

        {activeTab === 'features' && (
          <SettingsSection title="Feature Flags" icon={Zap}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.features || {}).map(([key, value]) => (
                <ToggleField
                  key={key}
                  label={key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                  description={`Enable or disable ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  checked={value}
                  onChange={(checked) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, [key]: checked },
                    })
                  }
                />
              ))}
            </div>
          </SettingsSection>
        )}

        {activeTab === 'api' && (
          <SettingsSection title="API Keys" icon={Key}>
            <div className="space-y-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                      Critical Security Warning
                    </h4>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      API keys are extremely sensitive credentials. Never share them publicly or commit to version control.
                    </p>
                  </div>
                </div>
              </div>

              {(disclosure === 'masked' || disclosure === 'full') && formData.apiKeys?.geminiApiKey && (
                <InputField
                  label="Gemini API Key"
                  type={disclosure === 'full' ? 'text' : 'password'}
                  value={formData.apiKeys?.geminiApiKey || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apiKeys: {
                        ...formData.apiKeys,
                        geminiApiKey: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter Gemini API key"
                />
              )}

              {(disclosure === 'masked' || disclosure === 'full') && formData.apiKeys?.bundleSocialApiKey && (
                <InputField
                  label="Bundle Social API Key"
                  type={disclosure === 'full' ? 'text' : 'password'}
                  value={formData.apiKeys?.bundleSocialApiKey || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apiKeys: {
                        ...formData.apiKeys,
                        bundleSocialApiKey: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter Bundle Social API key"
                />
              )}

              <InputField
                label="Bundle Social Organization ID"
                value={formData.apiKeys?.bundleSocialOrgId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    apiKeys: {
                      ...formData.apiKeys,
                      bundleSocialOrgId: e.target.value,
                    },
                  })
                }
                placeholder="Enter organization ID"
              />

              {disclosure === 'public' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    🔒 API Keys are hidden in public mode. Only Organization ID is visible.
                  </p>
                </div>
              )}
            </div>
          </SettingsSection>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingChanges(null);
        }}
        title="Confirm Settings Update"
      >
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  ⚠️ Updating System Settings
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  You are about to update system settings. These changes will affect the entire application.
                </p>
              </div>
            </div>
          </div>

          {/* Disclosure Mode Info */}
          <div className={`p-4 rounded-xl border ${
            disclosure === 'full' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              : disclosure === 'masked'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          }`}>
            <div className="flex items-start gap-3">
              <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                disclosure === 'full' 
                  ? 'text-red-600 dark:text-red-400'
                  : disclosure === 'masked'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-green-600 dark:text-green-400'
              }`} />
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${
                  disclosure === 'full' 
                    ? 'text-red-800 dark:text-red-300'
                    : disclosure === 'masked'
                    ? 'text-blue-800 dark:text-blue-300'
                    : 'text-green-800 dark:text-green-300'
                }`}>
                  Current Mode: {disclosure.charAt(0).toUpperCase() + disclosure.slice(1)} Disclosure
                </h4>
                <p className={`text-xs ${
                  disclosure === 'full' 
                    ? 'text-red-700 dark:text-red-400'
                    : disclosure === 'masked'
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-green-700 dark:text-green-400'
                }`}>
                  {disclosure === 'full' && 'All fields including secrets will be updated with their current values.'}
                  {disclosure === 'masked' && 'Only non-masked fields will be updated. Secrets remain unchanged unless edited in full mode.'}
                  {disclosure === 'public' && 'Only public fields will be updated. All secrets are protected.'}
                </p>
              </div>
            </div>
          </div>

          {/* What will be updated */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600" />
              What will be updated:
            </h5>
            <div className="max-h-60 overflow-y-auto space-y-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              {pendingChanges && Object.keys(pendingChanges).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(pendingChanges).map(([section, values]) => {
                    if (values && typeof values === 'object' && Object.keys(values).length > 0) {
                      return (
                        <div key={section} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200/20 dark:border-purple-700/20">
                          <h6 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 uppercase tracking-wider">
                            {section}
                          </h6>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 ml-3">
                            {Object.keys(values).map((key) => (
                              <li key={key} className="list-disc">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                  No changes detected
                </p>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/20 dark:border-purple-700/20">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Important Notes:</h5>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Changes take effect immediately after confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Application may require restart for some settings</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Invalid configurations may cause system errors</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => {
                setConfirmModalOpen(false);
                setPendingChanges(null);
              }}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7E29F0] to-[#561E97] hover:from-[#6821D0] hover:to-[#4A1877] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Reusable components
const SettingsSection = ({ title, icon: Icon, children }) => (
  <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-purple-500/20 rounded-3xl shadow-xl overflow-hidden">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-3xl" />
    
    <div className="relative">
      {/* Header */}
      <div className="px-8 py-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#7E29F0] to-[#561E97] rounded-xl">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">{children}</div>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder, readOnly = false }) => {
  const isMasked = value && typeof value === 'string' && value.includes('••');
  const isReadOnly = readOnly || isMasked;
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {isMasked && (
          <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">(Masked - switch to Full to edit)</span>
        )}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={isReadOnly}
          className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400 ${
            isReadOnly ? 'cursor-not-allowed opacity-60' : ''
          }`}
        />
        {isMasked && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
};

const ToggleField = ({ label, description, checked, onChange }) => (
  <div className="p-6 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-purple-200/50 dark:border-purple-700/30 rounded-2xl">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#7E29F0] focus:ring-offset-2 ${
          checked ? 'bg-gradient-to-r from-[#7E29F0] to-[#561E97]' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </div>
);

export default Settings;
