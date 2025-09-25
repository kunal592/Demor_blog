/**
 * BlogDetail Page
 * - Fetches blog by slug
 * - Displays blog content
 * - Shows comments + allows adding new comment
 * - Handles like/bookmark state via userInteractions
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogService } from '../services/blogService';
import { Blog, Comment, UserInteractions } from '../types';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userInteractions, setUserInteractions] = useState<UserInteractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!slug) return;

        // ✅ get blog + user interactions
        const { blog, userInteractions } = await blogService.getBlogBySlug(slug);
        setBlog(blog);
        setUserInteractions(userInteractions);

        // ✅ fetch comments (direct array, not { comments })
        const commentsData = await blogService.getComments(blog.id);
        setComments(commentsData);
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !blog) return;
    try {
      // ✅ addComment returns a single Comment, not { comment }
      const newCmt = await blogService.addComment(blog.id, newComment);
      setComments([newCmt, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Blog Header */}
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        By {blog.author.name} • {new Date(blog.createdAt).toLocaleDateString()}
      </p>

      {/* Blog Content */}
      <div
        className="prose max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* User Interactions */}
      {userInteractions && (
        <div className="flex gap-4 mb-6">
          <p>❤️ {userInteractions.liked ? 'You liked this' : 'Not liked yet'}</p>
          <p>🔖 {userInteractions.bookmarked ? 'Bookmarked' : 'Not bookmarked'}</p>
        </div>
      )}

      {/* Comments */}
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      {/* Add comment form */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded p-2 mb-2"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Comment
        </button>
      </div>

      {/* List comments */}
      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="border p-3 rounded">
            <p className="text-gray-700">{c.content}</p>
            <p className="text-sm text-gray-500 mt-1">
              {c.user.name} • {new Date(c.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogDetail;
