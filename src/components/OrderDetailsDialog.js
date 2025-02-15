import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

const OrderDetailsDialog = ({ 
  open, 
  onClose, 
  order, 
  onEdit, 
  getStatusColor,
  isEditing = false,
  onSave,
  updating = false
}) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: '',
    phone: '',
    delivery_address: '',
    payment_method: '',
    status: '',
    buy_price: '',
    sell_price: '',
    quantity: '',
    admin_note: '',
    description: ''
  });

  useEffect(() => {
    if (order) {
      setFormData({
        patient_name: order.patient_name || '',
        age: order.age || '',
        gender: order.gender || '',
        phone: order.phone || '',
        delivery_address: order.delivery_address || '',
        payment_method: order.payment_method || '',
        status: order.status || '',
        buy_price: order.buy_price || '',
        sell_price: order.sell_price || '',
        quantity: order.quantity || '',
        admin_note: order.admin_note || '',
        description: order.description || ''
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(order.id, formData);
  };

  if (!order) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? `Edit Order #${order.id}` : `Order Details #${order.id}`}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {isEditing ? (
            // Edit Mode
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Buy Price"
                  name="buy_price"
                  type="number"
                  value={formData.buy_price}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sell Price"
                  name="sell_price"
                  type="number"
                  value={formData.sell_price}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Note"
                  name="admin_note"
                  multiline
                  rows={2}
                  value={formData.admin_note}
                  onChange={handleChange}
                />
              </Grid>
            </>
          ) : (
            // View Mode
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Patient Information</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>Name: {order.patient_name}</Typography>
                  <Typography>Age: {order.age || 'N/A'}</Typography>
                  <Typography>Gender: {order.gender || 'N/A'}</Typography>
                  <Typography>Phone: {order.phone}</Typography>
                  <Typography>Address: {order.delivery_address}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Box sx={{ pl: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography>Status:</Typography>
                    <Chip 
                      label={order.status.toUpperCase()} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>
                  <Typography>Payment Method: {order.payment_method}</Typography>
                  <Typography>Order Date: {formatDate(order.created_at)}</Typography>
                  {order.sell_price && (
                    <Typography>Price: ₹{order.sell_price}</Typography>
                  )}
                  {order.quantity && (
                    <Typography>Quantity: {order.quantity}</Typography>
                  )}
                  {order.total_price && (
                    <Typography>Total Amount: ₹{order.total_price}</Typography>
                  )}
                </Box>
              </Grid>

              {(order.description || order.admin_note) && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Notes</Typography>
                    <Box sx={{ pl: 2 }}>
                      {order.description && (
                        <Typography>
                          <strong>Description:</strong> {order.description}
                        </Typography>
                      )}
                      {order.admin_note && (
                        <Typography>
                          <strong>Admin Note:</strong> {order.admin_note}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {isEditing ? 'Cancel' : 'Close'}
        </Button>
        {isEditing ? (
          <Button 
            onClick={handleSave}
            variant="contained" 
            disabled={updating}
          >
            {updating ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        ) : (
          order.status === 'pending' && (
            <Button 
              onClick={() => onEdit(order)} 
              variant="contained" 
              color="primary"
            >
              Edit Order
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog; 