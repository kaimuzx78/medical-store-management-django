import React from 'react';
import { Box } from '@mui/material';
import UserSidebar from './UserSidebar';

const UserLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default UserLayout; 