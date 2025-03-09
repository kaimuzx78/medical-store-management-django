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
  FormHelperText,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const OrderMedicine = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  const validateField = (name, value) => {
    switch (name) {
      case 'patientName':
        if (!value.trim()) return 'Patient name is required';
        if (!/^[A-Za-z]+([\s][A-Za-z]+)*$/.test(value.trim())) 
          return 'Name should only contain letters and single spaces between words';
        if (value.length < 2 || value.length > 50)
          return 'Name should be between 2 and 50 characters';
        return '';

      case 'age':
        if (!value) return 'Age is required';
        if (isNaN(value) || value < 0 || value > 150)
          return 'Please enter a valid age between 0 and 150';
        return '';

      case 'gender':
        if (!value) return 'Please select a gender';
        if (!['male', 'female', 'other'].includes(value))
          return 'Please select a valid gender option';
        return '';

      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10)
          return 'Address should be at least 10 characters long';
        return '';

      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^[0-9]{10}$/.test(value))
          return 'Please enter a valid 10-digit phone number';
        return '';

      case 'paymentMethod':
        if (!value) return 'Please select a payment method';
        if (!['cash', 'upi', 'card'].includes(value))
          return 'Please select a valid payment option';
        return '';

      case 'description':
        if (value && value.length > 500)
          return 'Description should not exceed 500 characters';
        return '';

      case 'prescription':
        if (!value) return 'Please upload a prescription';
        const fileType = value.type;
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(fileType))
          return 'Please upload a valid file (JPG, PNG, or PDF)';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    // Special handling for patient name - only allow letters and spaces
    if (name === 'patientName') {
      newValue = value.replace(/[^A-Za-z\s]/g, '');
    }
    
    // Special handling for phone number
    if (name === 'phone') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    
    // Special handling for age
    if (name === 'age') {
      newValue = value ? Math.min(Math.max(parseInt(value) || 0, 0), 150) : '';
    }

    setOrderForm(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate the field immediately
    const error = validateField(name, newValue);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
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

      // Validate prescription immediately
      const error = validateField('prescription', file);
      setErrors(prev => ({
        ...prev,
        prescription: error
      }));
      setTouched(prev => ({
        ...prev,
        prescription: true
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(orderForm).forEach(field => {
      const error = validateField(field, orderForm[field]);
      if (error) newErrors[field] = error;
    });

    // Touch all fields
    setTouched(Object.keys(orderForm).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {}));

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setError('Please fill in all required fields correctly');
      const firstError = document.querySelector('.Mui-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    
    Object.keys(orderForm).forEach(key => {
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
        description: '',
        paymentMethod: 'cash'
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
        Request Medicines with Prescription
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Patient Name"
              name="patientName"
              value={orderForm.patientName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={touched.patientName && !!errors.patientName}
              helperText={(touched.patientName && errors.patientName) || 'Only letters and spaces allowed'}
              required
              InputLabelProps={{
                style: { color: touched.patientName && errors.patientName ? '#d32f2f' : undefined },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: touched.patientName && errors.patientName ? '#d32f2f' : undefined,
                  },
                },
              }}
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
              onBlur={handleBlur}
              error={touched.age && !!errors.age}
              helperText={(touched.age && errors.age) || 'Enter age between 0-150'}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth required error={touched.gender && !!errors.gender}>
              <InputLabel sx={{ 
                color: touched.gender && errors.gender ? '#d32f2f' : undefined 
              }}>
                Gender
              </InputLabel>
              <Select
                name="gender"
                value={orderForm.gender}
                onChange={handleInputChange}
                onBlur={handleBlur}
                label="Gender"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: touched.gender && errors.gender ? '#d32f2f' : undefined,
                  }
                }}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {touched.gender && errors.gender && (
                <FormHelperText error>{errors.gender}</FormHelperText>
              )}
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
              onBlur={handleBlur}
              error={touched.address && !!errors.address}
              helperText={(touched.address && errors.address) || 'Address should be at least 10 characters long'}
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
              onBlur={handleBlur}
              error={touched.phone && !!errors.phone}
              helperText={(touched.phone && errors.phone) || 'Enter 10 digit mobile number'}
              required
              inputProps={{ 
                maxLength: 10,
                pattern: '[0-9]*'
              }}
              InputLabelProps={{
                style: { color: touched.phone && errors.phone ? '#d32f2f' : undefined },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: touched.phone && errors.phone ? '#d32f2f' : undefined,
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={touched.paymentMethod && !!errors.paymentMethod}>
              <InputLabel sx={{ 
                color: touched.paymentMethod && errors.paymentMethod ? '#d32f2f' : undefined 
              }}>
                Payment Method
              </InputLabel>
              <Select
                name="paymentMethod"
                value={orderForm.paymentMethod}
                onChange={handleInputChange}
                onBlur={handleBlur}
                label="Payment Method"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: touched.paymentMethod && errors.paymentMethod ? '#d32f2f' : undefined,
                  }
                }}
              >
                <MenuItem value="cash">Cash on Delivery</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
              {touched.paymentMethod && errors.paymentMethod && (
                <FormHelperText error>{errors.paymentMethod}</FormHelperText>
              )}
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
              onBlur={handleBlur}
              error={touched.description && !!errors.description}
              helperText={(touched.description && errors.description) || 'Please mention any specific requirements or medicine details (max 500 characters)'}
              InputLabelProps={{
                style: { color: touched.description && errors.description ? '#d32f2f' : undefined },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: touched.description && errors.description ? '#d32f2f' : undefined,
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderColor: touched.prescription && errors.prescription ? '#d32f2f' : undefined 
              }}
            >
              <CardContent>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom 
                  color={touched.prescription && errors.prescription ? "error" : "text.secondary"}
                >
                  Upload Prescription *
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ 
                    mt: 1,
                    borderColor: touched.prescription && errors.prescription ? '#d32f2f' : undefined,
                    color: touched.prescription && errors.prescription ? '#d32f2f' : undefined
                  }}
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
                {touched.prescription && errors.prescription && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.prescription}
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
              sx={{ 
                mt: 2,
                backgroundColor: loading ? 'grey.400' : 'primary.main',
                '&:hover': {
                  backgroundColor: loading ? 'grey.400' : 'primary.dark',
                }
              }}
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