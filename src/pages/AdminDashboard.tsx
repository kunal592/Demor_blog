/**
 * Admin dashboard component with comprehensive management features
 * Features: User management, blog moderation, statistics, and system overview
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  UserCheck,
  UserX,
  Trash2,
  Search
} from 'lucide-react';
import apiClient  from '../services/apiClient';
import { AdminStats, User, Blog, ApiResponse, Comment } from '../types';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/admin')[1] || '';

  const navigationItems = [
    { label: 'Overview', path: '', icon: BarChart3 },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Blogs', path: '/blogs', icon: FileText },
    { label: 'Comments', path: '/comments', icon: MessageSquare },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-600">System Management</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={`/admin${item.path}`}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/blogs" element={<AdminBlogs />} />
            <Route path="/comments" element={<AdminComments />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Admin Overview Component
const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load statistics</h2>
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

  const { overview, recentActivity } = stats;

  const statCards = [
    {
      label: 'Total Users',
      value: overview.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      growth: overview.userGrowth
    },
    {
      label: 'Total Blogs',
      value: overview.totalBlogs,
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Published Blogs',
      value: overview.publishedBlogs,
      icon: Eye,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      label: 'Total Likes',
      value: overview.totalLikes,
      icon: Heart,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Overview</h1>
        <p className="text-gray-600">Monitor your blog platform's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.growth !== undefined && (
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">
                        {stat.growth > 0 ? '+' : ''}{stat.growth.toFixed(1)}% this month
                      </span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="p-6">
            {recentActivity.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=ffffff`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Blogs</h3>
          </div>
          <div className="p-6">
            {recentActivity.recentBlogs.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      blog.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                      <p className="text-sm text-gray-600">by {blog.author.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{blog._count.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{blog.viewCount}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          blog.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent blogs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Users Component
const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users');
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'USER' | 'ADMIN') => {
    try {
      await apiClient.put(`/admin/users/${userId}`, { role });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role } : user
      ));
      toast.success('User role updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.put(`/admin/users/${userId}`, { isActive });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, isActive } : user
      ));
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=ffffff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                      className={`text-sm rounded-full px-3 py-1 font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleUserStatus(user.id, !user.isActive)}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                        user.isActive
                          ? 'text-red-700 bg-red-100 hover:bg-red-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Blogs Component
const AdminBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const response = await apiClient.get<ApiResponse<{ blogs: Blog[] }>>('/admin/blogs');
      if (response.data.success && response.data.data) {
        setBlogs(response.data.data.blogs);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlogStatus = async (blogId: string, isPublished: boolean) => {
    try {
      await apiClient.put(`/admin/blogs/${blogId}`, { isPublished });
      setBlogs(prev => prev.map(blog =>
        blog.id === blogId ? { ...blog, isPublished } : blog
      ));
      toast.success(`Blog ${isPublished ? 'published' : 'unpublished'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update blog status');
    }
  };

  const toggleFeatured = async (blogId: string, isFeatured: boolean) => {
    try {
      await apiClient.put(`/admin/blogs/${blogId}`, { isFeatured });
      setBlogs(prev => prev.map(blog =>
        blog.id === blogId ? { ...blog, isFeatured } : blog
      ));
      toast.success(`Blog ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update blog featured status');
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/blogs/${blogId}`);
      setBlogs(prev => prev.filter(blog => blog.id !== blogId));
      toast.success('Blog deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete blog');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
        <p className="text-gray-600">Manage all blog posts, moderation, and featured content</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blog
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {blog.coverImage && (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {blog.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=3B82F6&color=ffffff`}
                        alt={blog.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{blog.author.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {blog.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{blog.viewCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{blog._count.likes}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => toggleBlogStatus(blog.id, !blog.isPublished)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          blog.isPublished
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {blog.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      
                      <button
                        onClick={() => toggleFeatured(blog.id, !blog.isFeatured)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          blog.isFeatured
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {blog.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      
                      <button
                        onClick={() => deleteBlog(blog.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No blogs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Comments Component
const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<{ comments: Comment[] }>>('/admin/moderation?type=comments');
      if (response.data.success && response.data.data) {
        setComments(response.data.data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments for moderation:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const moderateComment = async (commentId: string, isApproved: boolean) => {
    try {
      await apiClient.put(`/admin/comments/${commentId}`, { isApproved });
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success(`Comment ${isApproved ? 'approved' : 'rejected'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to moderate comment');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comment Moderation</h1>
        <p className="text-gray-600">Review and moderate comments before they are published</p>
      </div>

      {comments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <li key={comment.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Comment by {comment.user.name} on "{comment.blog.title}"
                    </p>
                    <p className="text-gray-600 mt-2">{comment.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      <Link
                        to={`/blog/${comment.blog.slug}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                      >
                        View blog post
                      </Link>
                      <span className="mx-2">•</span>
                      <span>
                        Submitted on {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => moderateComment(comment.id, true)}
                      className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <UserCheck className="h-4 w-4 mr-2 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => moderateComment(comment.id, false)}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <UserX className="h-4 w-4 mr-2 inline" />
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments to moderate</h3>
          <p className="text-gray-600">The moderation queue is currently empty.</p>
        </div>
      )}
    </div>
  );
};

// Admin Settings Component
const AdminSettings: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
          <p className="text-gray-600">System settings will be available in future updates</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;