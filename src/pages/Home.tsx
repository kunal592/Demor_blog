import React, { useEffect, useState } from 'react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const data = await blogService.getBlogs({ isFeatured: true, limit: 3 });
      setFeaturedBlogs(data.blogs);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Featured Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredBlogs.map((blog) => (
          <Link
            key={blog.id}
            to={`/blogs/${blog.slug}`}
            className="p-4 border rounded shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{blog.title}</h2>
            <p className="text-gray-600">{blog.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
