/**
 * UserProfile Page
 * - Fetches a user by ID
 * - Displays avatar, name, email
 * - Shows followers and following count
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { User } from '../types';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        // ✅ userService.getUserById now returns User directly
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={user.name || 'User avatar'} // ✅ fixed null handling
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Followers / Following */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">{user.followers?.length ?? 0}</p>
          <p className="text-gray-500 text-sm">Followers</p>
        </div>
        <div>
          <p className="text-lg font-bold">{user.following?.length ?? 0}</p>
          <p className="text-gray-500 text-sm">Following</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
