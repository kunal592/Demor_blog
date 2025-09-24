import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Zap, Star, PenTool } from 'lucide-react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const [latest, featured, trending] = await Promise.all([
          blogService.getBlogs({ limit: 4, sortBy: 'createdAt', order: 'desc' }),
          blogService.getBlogs({ limit: 3, isFeatured: true }),
          blogService.getBlogs({ limit: 5, sortBy: 'viewCount', order: 'desc' }),
        ]);
        setLatestBlogs(latest.blogs);
        setFeaturedBlogs(featured.blogs);
        setTrendingBlogs(trending.blogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Dive into the World of Ideas
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Explore, learn, and share your knowledge with a vibrant community of developers and thinkers.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to={user ? "/create-blog" : "/login"}
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
              <PenTool className="inline h-5 w-5 mr-2" />
              Start Writing
            </Link>
            <Link
              to="/blogs"
              className="bg-transparent border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Explore Blogs
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      {featuredBlogs.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-2" />
              Featured Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
                  <Link to={`/blog/${blog.slug}`}>
                    <img
                      src={blog.coverImage || `https://source.unsplash.com/random/400x250?sig=${blog.id}`}
                      alt={blog.title || 'Blog cover'}
                      className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <img
                          src={blog.author.avatar || ''}
                          alt={blog.author.name || 'Author'}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span className="text-sm font-medium text-gray-800">{blog.author.name}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 h-20 overflow-hidden">{blog.title}</h3>
                      <p className="text-gray-600 text-sm h-12 overflow-hidden">{blog.excerpt || blog.summary}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Blogs Section */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Zap className="h-8 w-8 text-blue-500 mr-2" />
            Fresh off the Press
          </h2>
          <div className="space-y-8">
            {latestBlogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row transform hover:-translate-y-1 transition-transform duration-300">
                <img
                  src={blog.coverImage || `https://source.unsplash.com/random/300x200?sig=${blog.id}`}
                  alt={blog.title || 'Blog post'}
                  className="w-full md:w-1/3 h-48 md:h-auto object-cover"
                />
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <Link to={`/blog/${blog.slug}`} className="block">
                      <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">{blog.title}</h3>
                      <p className="text-gray-600 mt-2 text-sm">{blog.excerpt || blog.summary}</p>
                    </Link>
                  </div>
                  <div className="flex items-center mt-4">
                    <img
                      src={blog.author.avatar || ''}
                      alt={blog.author.name || 'Author'}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{blog.author.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(blog.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/blogs"
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              See All Posts <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Trending Blogs Section */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
              Trending Now
            </h3>
            <div className="space-y-5">
              {trendingBlogs.map((blog, index) => (
                <div key={blog.id} className="flex items-start">
                  <span className="text-2xl font-bold text-gray-300 mr-4">{index + 1}</span>
                  <div>
                    <Link to={`/blog/${blog.slug}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                      {blog.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">by {blog.author.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;