/**
 * Navigation bar component with responsive design and user authentication
 * Features: Mobile menu, user dropdown, search functionality, and role-based navigation
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, PenTool, User, Settings, LogOut, Shield, Heart, Bookmark } from 'lucide-react';
import { useAuth } from '../App';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BlogApp</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search blogs..."
                onClick={() => navigate('/blogs')}
              />
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/create-blog"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <PenTool className="mr-3 h-4 w-4" />
                        Write Blog
                      </Link>
                      
                      <Link
                        to="/liked-blogs"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        Liked Blogs
                      </Link>
                      
                      <Link
                        to="/bookmarked-blogs"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bookmark className="mr-3 h-4 w-4" />
                        Bookmarks
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-md mt-2">
              {/* Mobile search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search blogs..."
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/blogs');
                    }}
                  />
                </div>
              </div>

              {/* Mobile navigation items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create-blog"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Write Blog
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
