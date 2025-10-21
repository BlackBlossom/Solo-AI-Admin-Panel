import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full h-screen m-0',
  };

  const isFullScreen = size === 'full';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="bg-black/70 backdrop-blur-sm z-[100]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
          />
          
          {/* Modal */}
          <div className="z-[110] overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}>
            <div className={`flex ${isFullScreen ? 'h-full' : 'min-h-full'} items-center justify-center ${isFullScreen ? 'p-0' : 'p-4'}`}>
              <motion.div
                initial={{ opacity: 0, scale: isFullScreen ? 1 : 0.95, y: isFullScreen ? 0 : 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: isFullScreen ? 1 : 0.95, y: isFullScreen ? 0 : 20 }}
                transition={{ duration: 0.2 }}
                className={`w-full ${sizes[size]} ${isFullScreen ? 'bg-white h-full' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl'} shadow-2xl overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
              >
                {isFullScreen ? (
                  // Full screen mode - no header/footer, just content
                  <div className="h-full">
                    {children}
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    {title && (
                      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                        {showCloseButton && (
                          <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <X size={24} />
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="relative p-6 max-h-[calc(110vh-200px)] overflow-y-auto">
                      {children}
                    </div>
                    
                    {/* Footer */}
                    {footer && (
                      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        {footer}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
