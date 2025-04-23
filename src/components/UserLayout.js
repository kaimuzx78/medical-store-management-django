import React from 'react';
import { Box } from '@mui/material';
import UserSidebar from './UserSidebar';

const UserLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <UserSidebar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            overflowX: 'hidden'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout; 