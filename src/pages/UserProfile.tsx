import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        const [userResponse, blogsResponse] = await Promise.all([
          apiClient.get(`/users/${userId}`),
          apiClient.get(`/blogs?author=${userId}`),
        ]);
        setUser(userResponse.data.data.user);
        setBlogs(blogsResponse.data.data.blogs);
      } catch (error) {
        console.error('Error fetching user and blogs:', error);
      }
    };
    fetchUserAndBlogs();
  }, [userId]);

  const handleFollow = async () => {
    try {
      await apiClient.post(`/users/${userId}/follow`);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await apiClient.delete(`/users/${userId}/unfollow`);
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleFetchComments = async (blogId) => {
    if (comments[blogId]) return;
    try {
      const response = await apiClient.get(`/blogs/${blogId}/comments`);
      setComments((prevComments) => ({
        ...prevComments,
        [blogId]: response.data.data.comments,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePostComment = async (blogId) => {
    try {
      const response = await apiClient.post(`/blogs/${blogId}/comments`, {
        content: newComment,
      });
      setComments((prevComments) => ({
        ...prevComments,
        [blogId]: [response.data.data.comment, ...(prevComments[blogId] || [])],
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {isFollowing ? (
        <button onClick={handleUnfollow}>Unfollow</button>
      ) : (
        <button onClick={handleFollow}>Follow</button>
      )}

      <hr />

      <h2>Blogs</h2>
      {blogs.map((blog) => (
        <div key={blog.id}>
          <h3>{blog.title}</h3>
          <p>{blog.content}</p>
          <button onClick={() => handleFetchComments(blog.id)}>Load Comments</button>

          {comments[blog.id] && (
            <div>
              <h4>Comments</h4>
              {comments[blog.id].map((comment) => (
                <div key={comment.id}>
                  <p>
                    <strong>{comment.user.name}</strong>: {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button onClick={() => handlePostComment(blog.id)}>Post Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
