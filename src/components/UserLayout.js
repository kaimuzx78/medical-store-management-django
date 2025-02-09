import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container
} from '@mui/material';
import {
  Logout as LogoutIcon,
  LocalPharmacy as LogoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="fixed">
        <Toolbar>
          <LogoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medical Store - User Portal
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          pb: 4,
          px: 2
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default UserLayout; 