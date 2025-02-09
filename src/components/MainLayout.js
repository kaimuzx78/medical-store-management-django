import { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  LocalHospital as LogoIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location.replace('/login');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <Sidebar />
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar 
          position="fixed" 
          sx={{ 
            ml: '240px', 
            width: 'calc(100% - 240px)',
            backgroundColor: '#fff',
            color: '#333',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: theme.zIndex.drawer + 1,  // Add this to keep AppBar above other content
          }}
        >
          <Toolbar sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            minHeight: '48px !important',
            pr: 3  // Add right padding
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
            }}>
              <Typography sx={{ 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                Welcome, {username}
              </Typography>
              <IconButton 
                onClick={handleLogout}
                size="small"
                sx={{ 
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: 1,
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Add a toolbar placeholder to prevent content from hiding under AppBar */}
        <Toolbar />

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: '#f5f5f5',
            overflow: 'auto',
            height: '100%'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 