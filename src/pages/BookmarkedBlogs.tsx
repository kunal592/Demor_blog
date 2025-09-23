/**
 * Bookmarked blogs page component showing user's saved content
 * Features: Grid layout, pagination, and bookmark management
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Eye, Calendar, User, ArrowLeft } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Blog, ApiResponse, PaginationData } from '../types';
import Loading from '../components/Loading';

const BookmarkedBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadBookmarkedBlogs();
  }, [pagination.page]);

  const loadBookmarkedBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse<{
        blogs: Blog[];
        pagination: PaginationData;
      }>>('/users/bookmarks', {
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.data.success && response.data.data) {
        setBlogs(response.data.data.blogs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load bookmarked blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && blogs.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <Bookmark className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Bookmarked Blogs</h1>
          </div>
          <p className="text-lg text-gray-600">
            Your saved blogs for later reading
          </p>
        </div>

        {/* Results Info */}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} bookmarked blogs
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {blog.coverImage && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Bookmark indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=3B82F6&color=ffffff`}
                        alt={blog.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{blog.author.name}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                    </div>
                    <Bookmark className="h-5 w-5 text-blue-500 fill-current" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.summary || blog.excerpt}
                  </p>

                  {/* Stats and Read More */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Bookmark className="h-4 w-4 text-blue-500 fill-current" />
                        <span>Saved</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{blog.viewCount}</span>
                      </span>
                      {blog.readTime && (
                        <span>{blog.readTime} min read</span>
                      )}
                    </div>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No bookmarked blogs yet</h3>
              <p className="text-gray-600 mb-6">
                Start bookmarking blogs you want to read later or revisit. Your saved content will appear here.
              </p>
              <Link
                to="/blogs"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Discover Blogs
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {pagination.pages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.pages === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pagination.pages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedBlogs;