import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { User, Blog, Comment } from '../types';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
  const [newComments, setNewComments] = useState<{[key: string]: string}>({});
  const [visibleComments, setVisibleComments] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [userResponse, blogsResponse] = await Promise.all([
          apiClient.get(`/users/${userId}`),
          apiClient.get(`/blogs?author=${userId}`),
        ]);
        setUser(userResponse.data.data.user);
        setBlogs(blogsResponse.data.data.blogs);
        setIsFollowing(
          userResponse.data.data.user.followers.some(
            (follower: any) => follower.followerId === currentUser?.id
          )
        );
      } catch (error) {
        toast.error('Failed to fetch user data.');
        console.error('Error fetching user and blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndBlogs();
  }, [userId, currentUser?.id]);

  const handleFollowToggle = useCallback(async () => {
    if (!userId || !currentUser) {
      toast.error('You must be logged in to follow users.');
      return;
    }
    
    setIsFollowLoading(true);
    const originalFollowingState = isFollowing;
    const originalUser = user;

    // Optimistic update
    setIsFollowing(!originalFollowingState);
    setUser(prevUser => {
      if (!prevUser) return null;
      const currentFollowers = prevUser.followers || [];
      if (originalFollowingState) {
        // Unfollow
        return { 
          ...prevUser, 
          followers: currentFollowers.filter(f => f.followerId !== currentUser.id) 
        };
      } else {
        // Follow
        const newFollower = { followerId: currentUser.id, followingId: userId };
        return { ...prevUser, followers: [...currentFollowers, newFollower as any] };
      }
    });

    try {
      if (originalFollowingState) {
        await apiClient.delete(`/users/${userId}/unfollow`);
        toast.success(`Unfollowed ${user?.name || 'user'}`);
      } else {
        await apiClient.post(`/users/${userId}/follow`);
        toast.success(`Followed ${user?.name || 'user'}`);
      }
    } catch (error) {
      toast.error('Failed to update follow status.');
      // Revert on error
      setIsFollowing(originalFollowingState);
      setUser(originalUser);
      console.error('Error following/unfollowing user:', error);
    } finally {
      setIsFollowLoading(false);
    }
  }, [userId, currentUser, isFollowing, user]);

  const handleToggleComments = useCallback(async (blogId: string) => {
    const newVisibleComments = new Set(visibleComments);
    if (newVisibleComments.has(blogId)) {
      newVisibleComments.delete(blogId);
    } else {
      newVisibleComments.add(blogId);
      // Fetch comments only if they haven't been fetched before
      if (!comments[blogId]) {
        try {
          const response = await apiClient.get(`/blogs/${blogId}/comments`);
          setComments(prev => ({ ...prev, [blogId]: response.data.data.comments }));
        } catch (error) {
          toast.error('Failed to fetch comments.');
          console.error('Error fetching comments:', error);
        }
      }
    }
    setVisibleComments(newVisibleComments);
  }, [visibleComments, comments]);

  const handlePostComment = async (blogId: string) => {
    const content = newComments[blogId];
    if (!content || !content.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }
    
    setIsCommentLoading(blogId);

    try {
      const response = await apiClient.post(`/blogs/${blogId}/comments`, { content });
      const newComment = response.data.data.comment;
      
      setComments(prev => ({
        ...prev,
        [blogId]: [newComment, ...(prev[blogId] || [])],
      }));
      
      setNewComments(prev => ({ ...prev, [blogId]: '' })); // Clear input
      toast.success('Comment posted!');

    } catch (error) {
      toast.error('Failed to post comment.');
      console.error('Error posting comment:', error);
    } finally {
      setIsCommentLoading(null);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <div className="text-center p-10 text-xl">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardContent className="p-6 flex items-center">
          <Avatar className="h-24 w-24 mr-6">
            <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
            <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex space-x-4 mt-2">
              <p><strong>{user.followers?.length || 0}</strong> Followers</p>
              <p><strong>{user.following?.length || 0}</strong> Following</p>
            </div>
          </div>
          {currentUser?.id !== userId && (
            <Button onClick={handleFollowToggle} disabled={isFollowLoading}>
              {isFollowLoading ? 'Updating...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </Button>
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
              <Button onClick={() => handleToggleComments(blog.id)}>
                {visibleComments.has(blog.id) ? 'Hide Comments' : 'Load Comments'}
              </Button>

              {visibleComments.has(blog.id) && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Comments</h4>
                  {(comments[blog.id] || []).map((comment) => (
                    <div key={comment.id} className="p-2 border-l-4">
                      <p>
                        <strong>{comment.user?.name || 'User'}</strong>: {comment.content}
                      </p>
                    </div>
                  ))}

                  <div className="mt-4 flex">
                    <Textarea
                      value={newComments[blog.id] || ''}
                      onChange={(e) => setNewComments(prev => ({...prev, [blog.id]: e.target.value}))}
                      placeholder="Add a comment"
                      className="mr-2"
                      disabled={isCommentLoading === blog.id}
                    />
                    <Button onClick={() => handlePostComment(blog.id)} disabled={isCommentLoading === blog.id}>
                      {isCommentLoading === blog.id ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;