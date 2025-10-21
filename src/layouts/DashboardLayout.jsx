import { motion } from 'framer-motion';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#000001] via-[#190830] to-[#561E97] overflow-hidden">
      {/* Background Pattern Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header - Fixed */}
      <header className="relative z-30 backdrop-blur-xl bg-[#190830]/80 border-b border-purple-500/20 shadow-lg shadow-purple-900/10 flex-shrink-0">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Left - Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7E29F0] to-[#561E97] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 ring-2 ring-purple-400/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                SoloAI Admin Panel
              </h1>
              <p className="text-xs text-purple-300/70 hidden sm:block">Manage your video content</p>
            </div>
          </div>

          {/* Right - User Profile & Logout */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-purple-300/70">{user?.role || 'Administrator'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7E29F0] to-[#561E97] flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/50 ring-2 ring-purple-400/30">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 font-medium text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content - Scrollable */}
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 pb-32 sm:pb-28">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Fixed */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
