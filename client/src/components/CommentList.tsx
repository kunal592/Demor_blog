import React, { useState, useEffect } from 'react';
import { getComments, createComment } from '../services/commentService';
import Comment from './Comment';
import { Comment as CommentType } from '../types';

interface CommentListProps {
  slug: string;
}

const CommentList: React.FC<CommentListProps> = ({ slug }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setError(null);
      const res = await getComments(slug);
      setComments(res.data);
    } catch (err) {
      setError('Failed to fetch comments');
    }
  };

  useEffect(() => {
    if (slug) {
        fetchComments();
    }
  }, [slug]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setError(null);
      await createComment(slug, newComment);
      setNewComment('');
      fetchComments();
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleAddComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          required
          style={{ width: '100%', minHeight: '100px', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Add Comment
        </button>
      </form>
      <hr style={{ margin: '2rem 0' }} />
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} slug={slug} onCommentAdded={fetchComments} />
      ))}
    </div>
  );
};

export default CommentList;
