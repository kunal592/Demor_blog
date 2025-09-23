import React, { useState, useEffect } from 'react';
import { getComments, createComment } from '../services/commentService';
import Comment from './Comment';

const CommentList = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      const res = await getComments(slug);
      setComments(res.data);
    } catch (err) {
      setError('Failed to fetch comments');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
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
