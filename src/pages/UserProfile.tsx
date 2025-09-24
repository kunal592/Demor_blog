import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { User, Blog, Comment } from '../types';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      if (!userId) return;
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
    if (!userId) return;
    try {
      await apiClient.post(`/users/${userId}/follow`);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!userId) return;
    try {
      await apiClient.delete(`/users/${userId}/unfollow`);
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleFetchComments = async (blogId: string) => {
    if (comments[blogId]) {
      setComments((prevComments) => {
        const newComments = { ...prevComments };
        delete newComments[blogId];
        return newComments;
      });
      return;
    }
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

  const handlePostComment = async (blogId: string) => {
    if (!newComment.trim()) return;
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
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardContent className="p-6 flex items-center">
          <Avatar className="h-24 w-24 mr-6">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
          {isFollowing ? (
            <Button onClick={handleUnfollow}>Unfollow</Button>
          ) : (
            <Button onClick={handleFollow}>Follow</Button>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Blogs by {user.name}</h2>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Card key={blog.id}>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">{blog.title}</h3>
              <p className="text-gray-700 mb-4">{blog.content}</p>
              <Button onClick={() => handleFetchComments(blog.id)}>
                {comments[blog.id] ? 'Hide Comments' : 'Load Comments'}
              </Button>

              {comments[blog.id] && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Comments</h4>
                  {comments[blog.id].map((comment) => (
                    <div key={comment.id} className="p-2 border-l-4">
                      <p>
                        <strong>{comment.user.name}</strong>: {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  className="mr-2"
                />
                <Button onClick={() => handlePostComment(blog.id)}>Post</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
