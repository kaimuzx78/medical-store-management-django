import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  History as HistoryIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import AIChat from '../components/AIChat';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axiosInstance.get('/api/verify-token/');
        setLoading(false);
      } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    verifyAuth();
  }, [navigate]);

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h1">
                Welcome, {username}!
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                startIcon={<ProfileIcon />}
              >
                Logout
              </Button>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<OrderIcon />}
                    onClick={() => navigate('/user/order-medicine')}
                    sx={{ py: 2 }}
                  >
                    Order Medicine
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate('/user/order-history')}
                    sx={{ py: 2 }}
                  >
                    Order History
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <List>
                {orderHistory.length > 0 ? (
                  orderHistory.slice(0, 5).map((order, index) => (
                    <React.Fragment key={order.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Order #${order.id}`}
                          secondary={`Status: ${order.status}`}
                        />
                      </ListItem>
                      {index < orderHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent orders" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <AIChat />
    </Box>
  );
};

export default UserDashboard; 