/**
 * Blog detail page component with full blog content and interactions
 * Features: Markdown rendering, like/bookmark functionality, sharing, and responsive design
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Share2, Eye, Calendar, User, Tag, ArrowLeft, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import toast from 'react-hot-toast';
import { blogService } from '../services/blogService';
import { Blog, UserInteractions } from '../types';
import Loading from '../components/UI/Loading';
import { useAuth } from '../App';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [userInteractions, setUserInteractions] = useState<UserInteractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const response = await blogService.getBlogBySlug(slug);
      setBlog(response.blog);
      setUserInteractions(response.userInteractions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog || !user) {
      toast.error('Please login to like blogs');
      return;
    }

    try {
      setActionLoading('like');
      const response = await blogService.toggleLike(blog.id);
      
      setUserInteractions(prev => prev ? { ...prev, liked: response.liked } : null);
      setBlog(prev => prev ? {
        ...prev,
        _count: { ...prev._count, likes: response.likeCount }
      } : null);
      
      toast.success(response.liked ? 'Blog liked!' : 'Like removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle like');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookmark = async () => {
    if (!blog || !user) {
      toast.error('Please login to bookmark blogs');
      return;
    }

    try {
      setActionLoading('bookmark');
      const response = await blogService.toggleBookmark(blog.id);
      
      setUserInteractions(prev => prev ? { ...prev, bookmarked: response.bookmarked } : null);
      
      toast.success(response.bookmarked ? 'Blog bookmarked!' : 'Bookmark removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle bookmark');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async () => {
    if (!blog) return;

    const shareData = blogService.getShareData(blog);

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog not found</h2>
          <Link
            to="/blogs"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user && (user.id === blog.author.id || user.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/blogs"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to blogs
            </Link>

            {canEdit && (
              <Link
                to={`/edit-blog/${blog.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Link>
            )}
          </div>

          {/* Blog Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Author and Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img
                  src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=3B82F6&color=ffffff`}
                  alt={blog.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{blog.author.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{blog.viewCount} views</span>
                    </span>
                    {blog.readTime && (
                      <span>{blog.readTime} min read</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLike}
                  disabled={actionLoading === 'like'}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    userInteractions?.liked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${actionLoading === 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${userInteractions?.liked ? 'fill-current' : ''}`} />
                  {blog._count.likes}
                </button>

                <button
                  onClick={handleBookmark}
                  disabled={actionLoading === 'bookmark'}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    userInteractions?.bookmarked
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${actionLoading === 'bookmark' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${userInteractions?.bookmarked ? 'fill-current' : ''}`} />
                  Save
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blogs?tag=${tag}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-8">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 sm:h-80 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* AI Summary */}
          {blog.summary && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                AI Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">{blog.summary}</p>
              <p className="text-xs text-purple-600 mt-3">✨ Generated by Gemini AI</p>
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">{children}</h3>,
                p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={actionLoading === 'like'}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                userInteractions?.liked
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${actionLoading === 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`h-5 w-5 mr-2 ${userInteractions?.liked ? 'fill-current' : ''}`} />
              {userInteractions?.liked ? 'Liked' : 'Like'} ({blog._count.likes})
            </button>

            <button
              onClick={handleBookmark}
              disabled={actionLoading === 'bookmark'}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                userInteractions?.bookmarked
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${actionLoading === 'bookmark' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark className={`h-5 w-5 mr-2 ${userInteractions?.bookmarked ? 'fill-current' : ''}`} />
              {userInteractions?.bookmarked ? 'Saved' : 'Save'}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share this blog
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;