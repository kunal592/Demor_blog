/**
 * Main App component
 * - Provides global AuthContext
 * - Handles auth state (user + loading)
 * - Sets up routing (public, protected, admin)
 * - Integrates Navbar/Footer/Toaster
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';

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
import ContactUs from './pages/ContactUs';

// Auth hook, context, and types
import { useProvideAuth, useAuth } from './hooks/useAuth';
import { AuthContext } from './contexts/AuthContext';

// ------------------------------------------------
// 2. ProtectedRoute component
// ------------------------------------------------
// Wraps around protected routes, redirects to login if unauthenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return <>{children}</>; // allow access
};

// ------------------------------------------------
// 3. Main App Component
// ------------------------------------------------
function App() {
  const auth = useProvideAuth();

  // While checking auth → show loading spinner
  if (auth.loading) return <Loading fullScreen />;

  return (
    <AuthContext.Provider value={auth}>
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
              <Route path="/users/:userId" element={<UserProfile />} />
              <Route
                path="/login"
                element={auth.user ? <Navigate to="/dashboard" replace /> : <Login />}
              />
              <Route path="/contact" element={<ContactUs />} />

              {/* ---------------- Protected Routes ---------------- */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
              <Route path="/edit-blog/:id" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
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
