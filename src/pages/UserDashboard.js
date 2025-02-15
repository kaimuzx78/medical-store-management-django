import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalPharmacy as MedicineIcon,
  History as HistoryIcon,
  ShoppingCart as OrderIcon,
  Notifications as NotificationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import AIChat from '../components/AIChat';

const UserDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const username = localStorage.getItem('username');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quickActions = [
    {
      title: 'Order Medicine',
      description: 'Request medicines with prescription',
      icon: <MedicineIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/user/order-medicine',
      color: theme.palette.primary.light,
      buttonColor: 'primary'
    },
    {
      title: 'Order History',
      description: 'View your previous orders',
      icon: <HistoryIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      path: '/user/order-history',
      color: theme.palette.secondary.light,
      buttonColor: 'secondary'
    }
  ];

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/user/orders/');
      // Get the 5 most recent orders
      const recent = (response.data.data || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentOrders(recent);
    } catch (error) {
      setError('Failed to fetch recent orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (status) => {
    switch (status) {
      case 'approved':
        return <OrderIcon color="primary" />;
      case 'completed':
        return <MedicineIcon color="success" />;
      case 'pending':
        return <NotificationIcon color="warning" />;
      case 'rejected':
        return <NotificationIcon color="error" />;
      default:
        return <OrderIcon color="primary" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'approved':
        return 'primary.light';
      case 'completed':
        return 'success.light';
      case 'pending':
        return 'warning.light';
      case 'rejected':
        return 'error.light';
      default:
        return 'primary.light';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInMinutes > 0) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    return 'Just now';
  };

  const getActivityMessage = (order) => {
    switch (order.status) {
      case 'approved':
        return `Your order #${order.id} has been approved`;
      case 'completed':
        return `Order #${order.id} has been delivered`;
      case 'pending':
        return `Order #${order.id} is under review`;
      case 'rejected':
        return `Order #${order.id} was not approved`;
      default:
        return `Order #${order.id} status: ${order.status}`;
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Welcome Section */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 4, 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container alignItems="center" spacing={3}>
              <Grid item>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: 'white',
                    color: theme.palette.primary.main
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Grid>
              <Grid item>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {username}!
                </Typography>
                <Typography variant="subtitle1">
                  What would you like to do today?
                </Typography>
              </Grid>
            </Grid>
          </Box>
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -60,
              right: 80,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.title}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: action.color,
                      mb: 2
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {action.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color={action.buttonColor}
                    onClick={() => navigate(action.path)}
                    fullWidth
                  >
                    {action.title}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h6" sx={{ mb: 3 }}>
        Recent Activity
      </Typography>
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : recentOrders.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No recent activity
            </Typography>
          ) : (
            <Stack spacing={2}>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        mr: 2,
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: getActivityColor(order.status)
                      }}
                    >
                      {getActivityIcon(order.status)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        {getActivityMessage(order)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(order.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  {index < recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Add AIChat at the bottom */}
      <AIChat userType="user" />
    </Box>
  );
};

export default UserDashboard; 