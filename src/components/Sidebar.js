import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme,
  styled,
  Box,
  Typography,
  Badge,
  Divider
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  LocalHospital,
  AddCircle,
  Business,
  People,
  Receipt,
  Support,
  BusinessOutlined,
  LocalPharmacy as MedicineIcon,
  History as HistoryIcon,
  ShoppingCart as OrderIcon,
  NotificationsActive as RequestIcon,
  ShoppingCart,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const SidebarContainer = styled('div')(({ theme }) => ({
  width: 240,
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: theme.zIndex.drawer,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  transition: 'all 0.3s ease-in-out',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: '3px'
  }
}));

const StyledListItem = styled(ListItem)(({ theme, isactive }) => ({
  margin: '4px 8px',
  padding: '10px 16px',
  borderRadius: '10px',
  position: 'relative',
  backgroundColor: isactive === 'true' ? `${theme.palette.primary.main}15` : 'transparent',
  color: isactive === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: isactive === 'true' ? '70%' : '0%',
    width: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '0 4px 4px 0',
    transition: 'height 0.3s ease'
  },

  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}15`,
    transform: 'translateX(5px)',
    '& .MuiListItemIcon-root': {
      transform: 'scale(1.2)',
      color: theme.palette.primary.main
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 600
    }
  },

  '& .MuiListItemIcon-root': {
    minWidth: '40px',
    color: isactive === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: 'all 0.3s ease'
  },

  '& .MuiListItemText-primary': {
    fontSize: '0.95rem',
    fontWeight: isactive === 'true' ? 600 : 500,
    color: isactive === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: 'all 0.3s ease'
  }
}));

const LogoSection = styled(Box)(({ theme }) => ({
  padding: '24px 20px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  marginBottom: '10px',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}08`,
    '& .logo-icon': {
      transform: 'scale(1.1) rotate(5deg)'
    },
    '& .logo-text': {
      transform: 'translateX(3px)'
    }
  }
}));

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/orders/');
        const pending = response.data.data.filter(order => order.status === 'pending').length;
        
        if (pending > previousPendingCount) {
          if (Notification.permission === 'granted') {
            new Notification('New Medicine Order', {
              body: 'You have a new pending medicine order',
              icon: '/favicon.ico'
            });
          }
        }
        
        setPreviousPendingCount(pending);
        setPendingOrders(pending);
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, [previousPendingCount]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Add Medicine', icon: <MedicineIcon />, path: '/add-medicine' },
    { text: 'Manage Medicine', icon: <MedicineIcon />, path: '/manage-medicine' },
    { text: 'Company', icon: <BusinessOutlined />, path: '/manage-company-account' },
    { text: 'Manage Employee', icon: <People />, path: '/manage-employee' },
    { text: 'Generate Bill', icon: <Receipt />, path: '/generate-bill' },
    { text: 'Customer Request', icon: <RequestIcon />, path: '/customer-request' },
    { text: 'Bill History', icon: <HistoryIcon />, path: '/bill-history' },
    { text: 'Manage Orders', icon: <ShoppingCart />, path: '/manage-orders', badge: pendingOrders },
  ];

  return (
    <SidebarContainer>
      <LogoSection>
        <LocalHospital 
          className="logo-icon"
          sx={{ 
            fontSize: 35,
            color: theme.palette.primary.main,
            transition: 'transform 0.3s ease',
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))'
          }} 
        />
        <Typography 
          className="logo-text"
          variant="h6" 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 700,
            letterSpacing: '0.5px',
            fontSize: '1.3rem',
            transition: 'transform 0.3s ease',
            textShadow: '0px 2px 3px rgba(0,0,0,0.1)'
          }}
        >
          Medical Store
        </Typography>
      </LogoSection>

      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <StyledListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            isactive={(location.pathname === item.path).toString()}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>
    </SidebarContainer>
  );
};

export default Sidebar; 