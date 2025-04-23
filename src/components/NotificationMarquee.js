import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import axiosInstance from '../utils/axios';

const NotificationMarquee = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching active notifications...');
      const response = await axiosInstance.get('/api/notifications/active/');
      console.log('Active notifications response:', response.data);
      
      if (!response.data.error && response.data.data) {
        setNotifications(response.data.data);
        console.log('Set notifications:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (!notifications.length) {
    console.log('No notifications to display');
    return null;
  }

  console.log('Rendering notifications:', notifications);

  // Create a single string of notifications
  const notificationText = notifications.map(notification => notification.message).join(' • ');

  return (
    <Box
      sx={{
        width: '100%',
        height: '40px',
        backgroundColor: 'primary.main',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          whiteSpace: 'nowrap',
          willChange: 'transform',
          animation: 'marquee 30s linear infinite',
          '@keyframes marquee': {
            '0%': {
              left: '100%'
            },
            '100%': {
              left: '-100%'
            }
          }
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            color: 'white',
            padding: '8px 20px',
            '& span': { color: 'inherit' },
            '& strong': { fontWeight: 'bold' },
            '& em': { fontStyle: 'italic' },
            '& u': { textDecoration: 'underline' },
            '& *': { 
              color: 'inherit !important'
            }
          }}
          dangerouslySetInnerHTML={{ __html: notificationText }}
        />
      </Box>
    </Box>
  );
};

export default NotificationMarquee; 