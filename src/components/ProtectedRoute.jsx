import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import { ShieldOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, requiredRole, requiredPermission, requireAll = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.includes(user?.role);
    
    if (!hasRequiredRole) {
      return <AccessDenied reason="role" required={roles.join(', ')} />;
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    // Superadmin has all permissions
    if (user?.role === 'superadmin') {
      return children;
    }

    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const userPermissions = user?.permissions || [];
    
    // Check if user has required permissions
    const hasPermissions = requireAll
      ? permissions.every(perm => userPermissions.includes(perm))
      : permissions.some(perm => userPermissions.includes(perm));
    
    if (!hasPermissions) {
      return <AccessDenied reason="permission" required={permissions.join(', ')} />;
    }
  }

  return children;
};

// Access Denied Component
const AccessDenied = ({ reason, required }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
      {/* Subtle background pattern */}
      {/* <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div> */}

      {/* Gentle glow effects */}
      {/* <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" /> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full relative z-10"
      >
        {/* Subtle glow around card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl opacity-20 blur-xl" />
        
        <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-white/20">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative inline-flex items-center justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
              {reason === 'role' ? (
                <ShieldOff className="w-10 h-10 text-white" />
              ) : (
                <Lock className="w-10 h-10 text-white" />
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-3"
          >
            Access Denied
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-purple-100 mb-6"
          >
            {reason === 'role' 
              ? 'You do not have the required role to access this page.'
              : 'You do not have the required permissions to access this page.'}
          </motion.p>

          {/* Required info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-red-200 font-medium">
              Required {reason}: <span className="font-bold text-white">{required}</span>
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Go Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProtectedRoute;
