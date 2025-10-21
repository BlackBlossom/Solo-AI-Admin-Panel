import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check user permissions and roles
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific role
   * @param {string|string[]} requiredRole - Role or array of roles to check
   * @returns {boolean}
   */
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  };

  /**
   * Check if user has a specific permission
   * @param {string|string[]} requiredPermission - Permission or array of permissions
   * @param {boolean} requireAll - If true, user must have all permissions. If false, any permission is sufficient
   * @returns {boolean}
   */
  const hasPermission = (requiredPermission, requireAll = false) => {
    if (!user) return false;
    
    // Superadmin has all permissions
    if (user.role === 'superadmin') return true;
    
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const userPermissions = user.permissions || [];
    
    if (requireAll) {
      return permissions.every(perm => userPermissions.includes(perm));
    } else {
      return permissions.some(perm => userPermissions.includes(perm));
    }
  };

  /**
   * Check if user has access (either role or permission)
   * @param {Object} options - Access requirements
   * @param {string|string[]} options.role - Required role(s)
   * @param {string|string[]} options.permission - Required permission(s)
   * @param {boolean} options.requireAll - For permissions, require all instead of any
   * @returns {boolean}
   */
  const hasAccess = ({ role, permission, requireAll = false }) => {
    if (!user) return false;
    
    // Check role if specified
    if (role && !hasRole(role)) {
      return false;
    }
    
    // Check permission if specified
    if (permission && !hasPermission(permission, requireAll)) {
      return false;
    }
    
    return true;
  };

  /**
   * Check if user is superadmin
   * @returns {boolean}
   */
  const isSuperAdmin = () => {
    return user?.role === 'superadmin';
  };

  /**
   * Check if user is admin or superadmin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  };

  /**
   * Check if user is moderator
   * @returns {boolean}
   */
  const isModerator = () => {
    return user?.role === 'moderator';
  };

  /**
   * Get all user permissions
   * @returns {string[]}
   */
  const getPermissions = () => {
    if (user?.role === 'superadmin') {
      return ['users', 'media', 'videos', 'posts', 'analytics', 'settings', 'socialaccounts'];
    }
    return user?.permissions || [];
  };

  return {
    hasRole,
    hasPermission,
    hasAccess,
    isSuperAdmin,
    isAdmin,
    isModerator,
    getPermissions,
    user
  };
};
