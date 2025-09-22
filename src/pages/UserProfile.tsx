/**
 * User profile page component with profile management and statistics
 * Features: Profile editing, user statistics, and account settings
 */

import React, { useState, useEffect } from 'react';
import { User, Settings, Camera, Save, Mail, Calendar, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import { UserStats, ApiResponse } from '../types';
import Loading from '../components/UI/Loading';
import { useAuth } from '../App';

const UserProfile: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put<ApiResponse<{ user: any }>>('/users/profile', formData);
      
      if (response.data.success) {
        await refreshAuth(); // Refresh user data in context
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load profile</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Blogs Published',
      value: stats.blogsPublished,
      icon: BarChart3,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: BarChart3,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Likes Received',
      value: stats.likesReceived,
      icon: BarChart3,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      label: 'Bookmarks Received',
      value: stats.bookmarksReceived,
      icon: BarChart3,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and view your blog statistics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-medium">
                          {formData.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{formData.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty to use default avatar
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed as it's linked to your Google account
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Role
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={user.role}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                  >
                    {saving ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
              <div className="space-y-4">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${stat.bgColor} p-2 rounded-lg`}>
                          <Icon className={`h-4 w-4 ${stat.textColor}`} />
                        </div>
                        <span className="text-sm text-gray-600">{stat.label}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Ready to write?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Share your thoughts and experiences with the community.
              </p>
              <button
                onClick={() => window.location.href = '/create-blog'}
                className="w-full bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create New Blog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;