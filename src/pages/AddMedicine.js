import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axiosInstance from '../utils/axios';

const AddMedicine = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    medical_type: '',
    buy_price: '',
    sell_price: '',
    c_gst: '',
    s_gst: '',
    batch_no: '',
    shelf_no: '',
    expire_date: null,
    mfg_date: null,
    description: '',
    in_stock_total: '',
    qty_in_strip: '',
    company_id: '',
    salt_name: '',
    salt_qty: '',
    salt_qty_type: '',
    medicine_details: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/api/company/');
      console.log('Company API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCompanies(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCompanies(response.data.data);
      } else {
        console.error('Invalid company data format:', response.data);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedData = {
        ...formData,
        expire_date: formData.expire_date?.toISOString().split('T')[0],
        mfg_date: formData.mfg_date?.toISOString().split('T')[0],
      };
      await axiosInstance.post('/api/medicine/', formattedData);
      alert('Medicine added successfully!');
      setFormData({
        name: '',
        medical_type: '',
        buy_price: '',
        sell_price: '',
        c_gst: '',
        s_gst: '',
        batch_no: '',
        shelf_no: '',
        expire_date: null,
        mfg_date: null,
        description: '',
        in_stock_total: '',
        qty_in_strip: '',
        company_id: '',
        salt_name: '',
        salt_qty: '',
        salt_qty_type: '',
        medicine_details: ''
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Error adding medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Add Medicine
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Medicine Type"
                  name="medical_type"
                  value={formData.medical_type}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Buy Price"
                  name="buy_price"
                  type="number"
                  value={formData.buy_price}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sell Price"
                  name="sell_price"
                  type="number"
                  value={formData.sell_price}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="C-GST"
                  name="c_gst"
                  type="number"
                  value={formData.c_gst}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="S-GST"
                  name="s_gst"
                  type="number"
                  value={formData.s_gst}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch No."
                  name="batch_no"
                  value={formData.batch_no}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Shelf No."
                  name="shelf_no"
                  value={formData.shelf_no}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expire Date"
                    value={formData.expire_date}
                    onChange={handleDateChange('expire_date')}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Mfg Date"
                    value={formData.mfg_date}
                    onChange={handleDateChange('mfg_date')}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="In Stock Total"
                  name="in_stock_total"
                  type="number"
                  value={formData.in_stock_total}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Qty. in Strip"
                  name="qty_in_strip"
                  type="number"
                  value={formData.qty_in_strip}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    label="Company"
                  >
                    {Array.isArray(companies) && companies.length > 0 ? (
                      companies.map((company) => (
                        <MenuItem key={company.id || company._id} value={company.id || company._id}>
                          {company.name || company.company_name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No companies available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salt Name"
                  name="salt_name"
                  value={formData.salt_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salt Qty"
                  name="salt_qty"
                  value={formData.salt_qty}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salt Qty Type"
                  name="salt_qty_type"
                  value={formData.salt_qty_type}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    px: 4,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  {loading ? 'Adding...' : 'Add Medicine'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddMedicine; 