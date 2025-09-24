/**
 * Home page component with hero section and featured content
 * Features: Hero banner, featured blogs, statistics, and call-to-action sections
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Heart, TrendingUp, Sparkles } from 'lucide-react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';
import Loading from '../components/Loading';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [featuredResponse, recentResponse] = await Promise.all([
        blogService.getBlogs({ 
          featured: true, 
          limit: 3,
          sortBy: 'viewCount',
          sortOrder: 'desc'
        }),
        blogService.getBlogs({ 
          limit: 6,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      ]);

      setFeaturedBlogs(featuredResponse.blogs);
      setRecentBlogs(recentResponse.blogs);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Blog Platform</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Write, Share, and
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Discover</span>
              <br />
              Amazing Stories
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join our community of writers and readers. Create beautiful blogs with markdown support, 
              get AI-powered summaries, and engage with content through likes, bookmarks, and shares.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/create-blog"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-150 hover:scale-105"
                >
                  Start Writing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-150 hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              
              <Link
                to="/blogs"
                className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow-lg border border-gray-200 transform transition-all duration-150 hover:scale-105"
              >
                Explore Blogs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'Active Writers', value: '1,200+' },
              { icon: BookOpen, label: 'Published Blogs', value: '5,400+' },
              { icon: Heart, label: 'Likes Given', value: '28,000+' },
              { icon: TrendingUp, label: 'Monthly Readers', value: '45,000+' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the most popular and engaging content from our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=3B82F6&color=ffffff`}
                        alt={blog.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{blog.author.name}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{formatDate(blog.createdAt)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.summary || blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{blog._count.likes}</span>
                        </span>
                        <span>{blog.readTime} min read</span>
                      </div>
                      
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                      >
                        Read more
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Blogs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Stories</h2>
              <p className="text-lg text-gray-600">
                Fresh content from our writing community
              </p>
            </div>
            
            <Link
              to="/blogs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentBlogs.map((blog) => (
              <article key={blog.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <img
                      src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=3B82F6&color=ffffff`}
                      alt={blog.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{blog.author.name}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{formatDate(blog.createdAt)}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {blog.summary || blog.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{blog._count.likes}</span>
                      </span>
                      <span>{blog.readTime} min</span>
                    </div>
                    
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of writers sharing their thoughts, experiences, and expertise with the world.
          </p>
          
          {user ? (
            <Link
              to="/create-blog"
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow-lg transform transition-all duration-150 hover:scale-105"
            >
              Write Your First Blog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow-lg transform transition-all duration-150 hover:scale-105"
            >
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
