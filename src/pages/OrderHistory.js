import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  LocalPharmacy as MedicineIcon,
  AccessTime as TimeIcon,
  AttachMoney as PriceIcon,
  Assignment as StatusIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/user/orders/');
      setOrders(response.data.data || []);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'primary',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Pending';
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const getPrescriptionUrl = (prescriptionUrl) => {
    if (!prescriptionUrl) {
      console.log('No prescription URL provided');
      return null;
    }
    
    console.log('Original prescription URL:', prescriptionUrl);
    
    // If it's already a full URL, return it
    if (prescriptionUrl.startsWith('http')) {
      console.log('Using full URL:', prescriptionUrl);
      return prescriptionUrl;
    }
    
    // Construct the full URL
    const fullUrl = `${process.env.REACT_APP_API_URL}${prescriptionUrl}`;
    console.log('Constructed full URL:', fullUrl);
    return fullUrl;
  };

  const handleViewPrescription = async (e, orderId) => {
    e.stopPropagation();
    try {
      const response = await axiosInstance.get(`/api/admin/orders/${orderId}/prescription/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error viewing prescription:', error);
      setError('Failed to load prescription. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Order History
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {orders.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No orders found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card 
                elevation={2}
                sx={{
                  '&:hover': {
                    boxShadow: 6,
                    cursor: 'pointer'
                  }
                }}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <MedicineIcon color="primary" />
                        <Typography variant="h6">
                          Order #{order.id}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <TimeIcon color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(order.created_at)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PriceIcon color="success" />
                        <Typography>
                          Total Amount: {formatPrice(order.total_price)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Chip
                          label={order.status.toUpperCase()}
                          color={getStatusColor(order.status)}
                          icon={<StatusIcon />}
                        />
                        {order.prescription_url && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => handleViewPrescription(e, order.id)}
                          >
                            View Prescription
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Patient Information</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>Name: {selectedOrder.patient_name}</Typography>
                  <Typography>Age: {selectedOrder.age || 'Not specified'}</Typography>
                  <Typography>Gender: {selectedOrder.gender || 'Not specified'}</Typography>
                  <Typography>Phone: {selectedOrder.phone}</Typography>
                  <Typography>Address: {selectedOrder.delivery_address}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Order Information</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>Status: 
                    <Chip
                      label={selectedOrder.status.toUpperCase()}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography>Order Date: {formatDate(selectedOrder.created_at)}</Typography>
                  <Typography>Payment Method: {selectedOrder.payment_method}</Typography>
                  <Typography>Total Amount: {formatPrice(selectedOrder.total_price)}</Typography>
                  {selectedOrder.quantity && (
                    <Typography>Quantity: {selectedOrder.quantity}</Typography>
                  )}
                </Box>
              </Grid>

              {selectedOrder.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Additional Notes</Typography>
                  <Box sx={{ pl: 2, py: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography>{selectedOrder.description}</Typography>
                  </Box>
                </Grid>
              )}

              {selectedOrder.admin_note && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Admin Note</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography>{selectedOrder.admin_note}</Typography>
                  </Box>
                </Grid>
              )}

              {selectedOrder.prescription_url && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={(e) => handleViewPrescription(e, selectedOrder.id)}
                  >
                    View Prescription
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OrderHistory; 