import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAllAsRead } from '../services/notificationService';

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f0f0f0' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowNotifications(!showNotifications)}>
          Notifications ({notifications.filter(n => !n.read).length})
        </button>
        {showNotifications && (
          <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', width: '300px' }}>
            {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}
            <button onClick={handleMarkAllAsRead} style={{ width: '100%', padding: '0.5rem', border: 'none', backgroundColor: '#f0f0f0', cursor: 'pointer' }}>
              Mark all as read
            </button>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {notifications.map((notification) => (
                <li key={notification.id} style={{ padding: '1rem', borderBottom: '1px solid #eee', backgroundColor: notification.read ? 'transparent' : '#f9f9f9' }}>
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
