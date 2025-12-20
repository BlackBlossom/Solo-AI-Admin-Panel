import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Image,
  Users,
  Video,
  FileText,
  BarChart3,
  Settings,
  ClipboardList,
  Menu,
  X,
  Shield,
  Bell,
  Scale,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const allMenuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, requireAuth: true },
  // { path: "/media", label: "Media", icon: Image, requiredPermission: "media" },
  { path: "/settings", label: "Settings", icon: Settings, requiredPermission: "settings" },
  { path: "/activity-logs", label: "Activity", icon: ClipboardList, requiredRole: "superadmin" },
  { path: "/users", label: "Users", icon: Users, requiredPermission: "users" },
  { path: "/admins", label: "Admins", icon: Shield, requiredRole: "superadmin" },
  { path: "/videos", label: "Videos", icon: Video, requiredPermission: "videos" },
  { path: "/notifications", label: "Notifications", icon: Bell, requiredRole: "superadmin" },
  { path: "/legal", label: "Legal", icon: Scale, requiredRole: "superadmin" },
  // { path: "/posts", label: "Posts", icon: FileText, requiredPermission: "posts" },
//   { path: "/analytics", label: "Analytics", icon: BarChart3, requiredPermission: "analytics" },
];

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleItemCount, setVisibleItemCount] = useState(4);

  // Filter menu items based on user role and permissions
  const hasAccess = (item) => {
    // Dashboard is accessible to all authenticated users
    if (item.requireAuth && !item.requiredRole && !item.requiredPermission) {
      return true;
    }

    // Check role-based access
    if (item.requiredRole) {
      const roles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
      if (!roles.includes(user?.role)) {
        return false;
      }
    }

    // Check permission-based access
    if (item.requiredPermission) {
      // Superadmin has all permissions
      if (user?.role === 'superadmin') {
        return true;
      }

      const permissions = Array.isArray(item.requiredPermission) ? item.requiredPermission : [item.requiredPermission];
      const userPermissions = user?.permissions || [];
      
      // User must have at least one of the required permissions
      const hasPermission = permissions.some(perm => userPermissions.includes(perm));
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  };

  // Get filtered menu items based on user access
  const menuItems = allMenuItems.filter(hasAccess);

  // Detect screen size and adjust visible items
  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const totalItems = menuItems.length;
      
      if (width < 400) {
        // Very small phones: Show as many as possible, reserve 1 for More if needed
        const maxVisible = Math.min(3, totalItems - 2);
        setVisibleItemCount(maxVisible > 0 ? maxVisible : totalItems);
      } else if (width < 640) {
        // Small phones: Show as many as possible, reserve 1 for More if needed
        const maxVisible = Math.min(3, totalItems - 2);
        setVisibleItemCount(maxVisible > 0 ? maxVisible : totalItems);
      } else if (width < 768) {
        // Large phones/tablets: 4 items + More (if more than 1 remaining)
        const maxVisible = Math.min(4, totalItems - 2);
        setVisibleItemCount(maxVisible > 0 ? maxVisible : totalItems);
      } else if (width < 1024) {
        // Tablets: 5 items + More (if more than 1 remaining)
        const maxVisible = Math.min(5, totalItems - 2);
        setVisibleItemCount(maxVisible > 0 ? maxVisible : totalItems);
      } else {
        // Desktop: 6 items + More (if more than 1 remaining)
        const maxVisible = Math.min(6, totalItems - 2);
        setVisibleItemCount(maxVisible > 0 ? maxVisible : totalItems);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const visibleItems = menuItems.slice(0, visibleItemCount);
  const moreItems = menuItems.slice(visibleItemCount);
  const showMoreButton = moreItems.length > 1; // Only show More button if 2+ items remain

  const renderNavItem = (item, isMobile = false) => {
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsMenuOpen(false)}
        className={`relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-xl sm:rounded-2xl transition-all duration-300 group ${
          isMobile ? 'w-full' : 'flex-1'
        } ${
          isActive 
            ? 'text-white' 
            : 'text-gray-400 hover:text-purple-300'
        }`}
      >
        {/* Active background with gradient */}
        {isActive && (
          <motion.div
            layoutId={isMobile ? "mobile-active-bg" : "active-bg"}
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/50"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
          <item.icon 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
              isActive ? 'scale-110' : 'group-hover:scale-105'
            }`} 
          />
          <span className="text-[10px] sm:text-xs font-medium leading-tight">{item.label}</span>
        </div>

        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            layoutId={isMobile ? "mobile-indicator" : "indicator"}
            className="absolute -top-0.5 sm:-top-1 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full shadow-lg"
            initial={false}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Bottom Navigation Bar - Desktop & Tablet */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden sm:block max-w-[95vw]"
      >
        {/* Glassmorphism Container */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 rounded-3xl blur-xl opacity-30" />
          
          {/* Main nav */}
          <div className="relative backdrop-blur-3xl bg-gradient-to-r from-[#190830]/80  to-[#190830]/80 border border-purple-500/30 rounded-3xl shadow-2xl px-2 sm:px-3 md:px-4 py-3">
            <div className="flex items-center gap-1 sm:gap-2">
              {visibleItems.map(item => renderNavItem(item))}
              
              {/* More Menu Button - Only show if 2+ items remain */}
              {showMoreButton && (
                <div className="relative flex-1">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-xl sm:rounded-2xl transition-all duration-300 w-full group ${
                    isMenuOpen || moreItems.some(item => item.path === location.pathname)
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  {/* Active background for More menu */}
                  {(isMenuOpen || moreItems.some(item => item.path === location.pathname)) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/50" />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">More</span>
                  </div>
                </button>

                {/* More Menu Dropdown */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full mb-4 right-0 min-w-[200px]"
                    >
                      {/* Glow for dropdown */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-30" />
                      
                      {/* Dropdown content */}
                      <div className="relative backdrop-blur-3xl bg-gradient-to-br from-[#190830]/85  to-[#190830]/85 border border-purple-500/30 rounded-2xl shadow-2xl p-2">
                        {moreItems.map(item => renderNavItem(item, true))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              )}
              
              {/* If only 1 item left, show it directly instead of More button */}
              {!showMoreButton && moreItems.length === 1 && renderNavItem(moreItems[0])}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-50 sm:hidden"
      >
        {/* Glassmorphism Container */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 rounded-3xl blur-xl opacity-30" />
          
          {/* Main nav */}
          <div className="relative backdrop-blur-3xl bg-gradient-to-r from-[#190830]/80 to-[#190830]/80 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl">
            <div className="flex items-center gap-1 px-2 py-2.5">
              {visibleItems.map(item => renderNavItem(item))}
              
              {/* Mobile More Button - Only show if 2+ items remain */}
              {showMoreButton && (
                <div className="relative flex-1">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-xl sm:rounded-2xl transition-all duration-300 w-full group ${
                    isMenuOpen || moreItems.some(item => item.path === location.pathname)
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  {/* Active background for More menu */}
                  {(isMenuOpen || moreItems.some(item => item.path === location.pathname)) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/50" />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center gap-0.5 sm:gap-1">
                    {isMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">More</span>
                  </div>
                </button>

                {/* Mobile More Menu Dropdown */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full mb-4 right-0 min-w-[200px]"
                    >
                      {/* Glow for dropdown */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-30" />
                      
                      {/* Dropdown content */}
                      <div className="relative backdrop-blur-3xl bg-gradient-to-br from-[#190830]/85 to-[#190830]/85 border border-purple-500/30 rounded-2xl shadow-2xl p-2">
                        {moreItems.map(item => renderNavItem(item, true))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              )}
              
              {/* If only 1 item left, show it directly instead of More button */}
              {!showMoreButton && moreItems.length === 1 && renderNavItem(moreItems[0])}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Click outside to close */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 hidden sm:block"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
