import React, { useEffect, useState } from 'react';
import { blogService } from '../services/blogService';
import { Blog } from '../types';

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        // ✅ Removed unused "res" variable — directly destructure data
        const { blogs } = await blogService.getUserBlogs({ page: 1, limit: 10 });
        setBlogs(blogs);
      } catch (err) {
        console.error('Failed to fetch user blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading your dashboard...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>

      {blogs.length > 0 ? (
        <ul className="space-y-4">
          {blogs.map((blog) => (
            <li
              key={blog.id}
              className="border p-4 rounded-md shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              <p className="text-gray-500 text-sm">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mt-2 line-clamp-2">{blog.excerpt}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">You haven’t written any blogs yet.</p>
      )}
    </div>
  );
};

export default Dashboard;
