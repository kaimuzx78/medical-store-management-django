import React from 'react';
import { Box, AppBar, Toolbar } from '@mui/material';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="fixed" sx={{ /* keep existing styles */ }}>
          {/* Keep the Toolbar with logo and logout */}
        </AppBar>
        
        <Box component="main" sx={{ /* existing styles */ }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 