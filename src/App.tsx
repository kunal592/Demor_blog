/**
 * Main App component
 * - Provides global AuthContext
 * - Handles auth state (user + loading)
 * - Sets up routing (public, protected, admin)
 * - Integrates Navbar/Footer/Toaster
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Loading from './components/UI/Loading';

// Pages
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import LikedBlogs from './pages/LikedBlogs';
import BookmarkedBlogs from './pages/BookmarkedBlogs';

// Auth service + types
import { authService } from './services/authService';
import { User } from './types';

// ------------------------------------------------
// 1. Define AuthContext shape (what context provides)
// ------------------------------------------------
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// Context initialized as undefined so we can enforce hook usage inside provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to access AuthContext (throws if called outside provider)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ------------------------------------------------
// 2. ProtectedRoute component
// ------------------------------------------------
// Wraps around protected routes, redirects to login if unauthenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />; // show spinner while checking auth
  if (!user) return <Navigate to="/login" replace />; // redirect if not logged in
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />; // block non-admins

  return <>{children}</>; // allow access
};

// ------------------------------------------------
// 3. Main App Component
// ------------------------------------------------
function App() {
  // Global state for auth
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Run once on app mount → check if user is logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // --- Auth check on page load ---
  const checkAuthStatus = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.warn('Auth check failed:', error);
      setUser(null); // ensure logged-out state
    } finally {
      setLoading(false);
    }
  };

  // --- Login via Google OAuth ---
  const login = async (credential: string) => {
    const userData = await authService.googleLogin(credential);
    setUser(userData);
  };

  // --- Logout user ---
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // --- Force refresh of auth state ---
  const refreshAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  // Context value passed to all children
  const authValue: AuthContextType = { user, loading, login, logout, refreshAuth };

  // While checking auth → show loading spinner
  if (loading) return <Loading />;

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Navbar always visible */}
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* ---------------- Public Routes ---------------- */}
              <Route path="/" element={<Home />} />
              <Route path="/blogs" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" replace /> : <Login />}
              />

              {/* ---------------- Protected Routes ---------------- */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
              <Route path="/edit-blog/:id" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/liked-blogs" element={<ProtectedRoute><LikedBlogs /></ProtectedRoute>} />
              <Route path="/bookmarked-blogs" element={<ProtectedRoute><BookmarkedBlogs /></ProtectedRoute>} />

              {/* ---------------- Admin Routes ---------------- */}
              <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

              {/* ---------------- Fallback (404) ---------------- */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer always visible */}
          <Footer />
        </div>

        {/* Toast notifications (global) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff' },
          }}
        />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
