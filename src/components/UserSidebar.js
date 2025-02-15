import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalPharmacy as MedicineIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user/dashboard' },
    { text: 'Order Medicine', icon: <MedicineIcon />, path: '/user/order-medicine' },
    { text: 'Order History', icon: <HistoryIcon />, path: '/user/order-history' },
    { text: 'Profile', icon: <PersonIcon />, path: '/user/profile' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'primary.main',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          Medical Store
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
            py: 1,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          <LogoutIcon />
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default UserSidebar; 