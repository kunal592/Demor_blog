/**
 * User dashboard component with statistics and recent activity
 * Features: User stats, recent blogs, liked/bookmarked content, and quick actions
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Heart, Bookmark, Eye, TrendingUp, Plus, Edit3, BarChart3 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { DashboardData, ApiResponse } from '../types';
import Loading from '../components/UI/Loading';
import { useAuth } from '../App';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardData>>('/users/dashboard');
      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load dashboard</h2>
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

  const { stats, recentBlogs, recentLikes, recentBookmarks } = dashboardData;

  const statCards = [
    {
      icon: PenTool,
      label: 'Blogs Published',
      value: stats.totalBlogs,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats.totalViews,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      icon: Heart,
      label: 'Liked Blogs',
      value: stats.totalLikes,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      icon: Bookmark,
      label: 'Bookmarks',
      value: stats.totalBookmarks,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your blog activity
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/create-blog"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Blogs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PenTool className="h-5 w-5 mr-2" />
                  Your Recent Blogs
                </h2>
                <Link
                  to="/create-blog"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Write New
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentBlogs.length > 0 ? (
                <div className="space-y-4">
                  {recentBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 ${blog.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                        >
                          {blog.title}
                        </Link>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{formatDate(blog.createdAt)}</span>
                          <span className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{blog._count.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{blog.viewCount}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            blog.isPublished 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {blog.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/edit-blog/${blog.id}`}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't written any blogs yet</p>
                  <Link
                    to="/create-blog"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Blog
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Recently Liked */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Recently Liked
                </h3>
              </div>
              <div className="p-6">
                {recentLikes.length > 0 ? (
                  <div className="space-y-3">
                    {recentLikes.slice(0, 3).map((blog) => (
                      <div key={blog.id} className="flex items-start space-x-3">
                        <img
                          src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=EF4444&color=ffffff`}
                          alt={blog.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {blog.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">by {blog.author.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No liked blogs yet</p>
                )}
                {recentLikes.length > 3 && (
                  <Link
                    to="/liked-blogs"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 block"
                  >
                    View all liked blogs →
                  </Link>
                )}
              </div>
            </div>

            {/* Recently Bookmarked */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bookmark className="h-5 w-5 mr-2 text-purple-500" />
                  Recently Bookmarked
                </h3>
              </div>
              <div className="p-6">
                {recentBookmarks.length > 0 ? (
                  <div className="space-y-3">
                    {recentBookmarks.slice(0, 3).map((blog) => (
                      <div key={blog.id} className="flex items-start space-x-3">
                        <img
                          src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=8B5CF6&color=ffffff`}
                          alt={blog.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {blog.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">by {blog.author.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No bookmarked blogs yet</p>
                )}
                {recentBookmarks.length > 3 && (
                  <Link
                    to="/bookmarked-blogs"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 block"
                  >
                    View all bookmarks →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ready to create something amazing?</h3>
              <p className="text-blue-100">Share your thoughts, experiences, and expertise with the world.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/create-blog"
                className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg transition-colors"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Start Writing
              </Link>
              <Link
                to="/blogs"
                className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Explore Blogs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;