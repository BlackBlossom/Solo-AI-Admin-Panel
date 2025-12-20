import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Media from './pages/Media';
import Users from './pages/Users';
import Admins from './pages/Admins';
import Videos from './pages/Videos';
import Posts from './pages/Posts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import Notifications from './pages/Notifications';
import Legal from './pages/Legal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard - Accessible to all authenticated users */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Media - Requires 'media' permission */}
            {/* <Route 
              path="media" 
              element={
                <ProtectedRoute requiredPermission="media">
                  <Media />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Users - Requires 'users' permission */}
            <Route 
              path="users" 
              element={
                <ProtectedRoute requiredPermission="users">
                  <Users />
                </ProtectedRoute>
              } 
            />
            
            {/* Admins - Requires superadmin role ONLY */}
            <Route 
              path="admins" 
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <Admins />
                </ProtectedRoute>
              } 
            />
            
            {/* Videos - Requires 'videos' permission */}
            <Route 
              path="videos" 
              element={
                <ProtectedRoute requiredPermission="videos">
                  <Videos />
                </ProtectedRoute>
              } 
            />
            
            {/* Posts - Requires 'posts' permission */}
            {/* <Route 
              path="posts" 
              element={
                <ProtectedRoute requiredPermission="posts">
                  <Posts />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Analytics - Requires 'analytics' permission */}
            {/* <Route 
              path="analytics" 
              element={
                <ProtectedRoute requiredPermission="analytics">
                  <Analytics />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Settings - Requires 'settings' permission */}
            <Route 
              path="settings" 
              element={
                <ProtectedRoute requiredPermission="settings">
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* Activity Logs - Requires superadmin role */}
            <Route 
              path="activity-logs" 
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <ActivityLogs />
                </ProtectedRoute>
              } 
            />
            
            {/* Notifications - Requires superadmin role */}
            <Route 
              path="notifications" 
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Legal Content - Requires superadmin role */}
            <Route 
              path="legal" 
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <Legal />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;