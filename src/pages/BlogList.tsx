/**
 * Blog list page component with filtering, search, and pagination
 * Features: Blog grid display, search functionality, tag filtering, and responsive design
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Heart, Bookmark, Eye, Calendar, User, Tag } from 'lucide-react';
import { blogService } from '../services/blogService';
import { Blog, BlogFilters } from '../types';
import Loading from '../components/Loading';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || '',
    tag: searchParams.get('tag') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadBlogs();
  }, [filters]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs(filters);
      setBlogs(response.blogs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({ ...prev, tag, page: 1 }));
    setSearchParams(tag ? { tag } : {});
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      tag: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  if (loading && blogs.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Amazing Blogs</h1>
          <p className="text-lg text-gray-600">
            Explore our collection of insightful articles, tutorials, and stories from our community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Latest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="viewCount-desc">Most Viewed</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>

              {(filters.search || filters.tag) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.tag) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleSearch('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.tag && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Tag: {filters.tag}
                  <button
                    onClick={() => handleTagFilter('')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {pagination.total > 0 ? (
              <>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} blogs
              </>
            ) : (
              'No blogs found'
            )}
          </p>
        </div>

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
                  {/* Author and Date */}
                  <div className="flex items-center space-x-2 mb-3">
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

                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagFilter(tag)}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </button>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats and Read More */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{blog._count.likes}</span>
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
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.tag
                  ? 'Try adjusting your search criteria or clearing filters.'
                  : 'Be the first to share your story with the community!'}
              </p>
              {(filters.search || filters.tag) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
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

export default BlogList;