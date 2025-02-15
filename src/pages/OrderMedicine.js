import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const OrderMedicine = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderForm, setOrderForm] = useState({
    patientName: '',
    age: '',
    gender: '',
    address: '',
    phone: '',
    prescription: null,
    description: '',
    paymentMethod: 'cash'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB');
        return;
      }
      setOrderForm(prev => ({
        ...prev,
        prescription: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    
    // Add all fields to formData
    Object.keys(orderForm).forEach(key => {
      // Special handling for description to ensure empty string if undefined
      if (key === 'description') {
        formData.append(key, orderForm[key] || '');
      } else {
        formData.append(key, orderForm[key]);
      }
    });

    try {
      const response = await axiosInstance.post('/api/order-medicine/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Order request submitted successfully!');
      setOrderForm({
        patientName: '',
        age: '',
        gender: '',
        address: '',
        phone: '',
        prescription: null,
        description: '',  // Clear description
        paymentMethod: 'cash'
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
        Request Medicines with Prescription
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Patient Name"
              name="patientName"
              value={orderForm.patientName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={orderForm.age}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={orderForm.gender}
                onChange={handleInputChange}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Delivery Address"
              name="address"
              multiline
              rows={2}
              value={orderForm.address}
              onChange={handleInputChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={orderForm.phone}
              onChange={handleInputChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={orderForm.paymentMethod}
                onChange={handleInputChange}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash on Delivery</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes/Description"
              name="description"
              multiline
              rows={3}
              value={orderForm.description}
              onChange={handleInputChange}
              helperText="Please mention any specific requirements or medicine details"
            />
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Upload Prescription
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 1 }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    required
                  />
                </Button>
                {orderForm.prescription && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Selected file: {orderForm.prescription.name}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Accepted formats: JPG, PNG, PDF (Max size: 5MB)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Order Request'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default OrderMedicine; 