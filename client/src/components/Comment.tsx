import React, { useState } from 'react';
import { likeComment, createComment } from '../services/commentService';

const Comment = ({ comment, slug, onCommentAdded }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState(null);

  const handleLike = async () => {
    try {
      await likeComment(slug, comment.id);
      // TODO: Update the UI to reflect the new like count
    } catch (err) {
      setError('Failed to like comment');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await createComment(slug, replyContent, comment.id);
      setReplyContent('');
      setShowReplyForm(false);
      onCommentAdded(); // Callback to refresh the comment list
    } catch (err) {
      setError('Failed to add reply');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '1rem', marginBottom: '1rem' }}>
      <p>{comment.content}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button onClick={handleLike}>Like</button>
        <span>{comment.likes?.length || 0} Likes</span>
        <button onClick={() => setShowReplyForm(!showReplyForm)}>Reply</button>
      </div>
      {showReplyForm && (
        <form onSubmit={handleReplySubmit}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            required
            style={{ width: '100%', minHeight: '70px', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Post Reply
          </button>
        </form>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginLeft: '2rem', marginTop: '1rem' }}>
        {comment.replies && comment.replies.map(reply => (
          <Comment key={reply.id} comment={reply} slug={slug} onCommentAdded={onCommentAdded} />
        ))}
      </div>
    </div>
  );
};

export default Comment;
