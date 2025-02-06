import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  Divider,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';

const GenerateBill = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    console.log('Current medicines state:', medicines);
  }, [medicines]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      console.log('Fetching medicines...');
      const response = await axiosInstance.get('/api/medicine/');
      console.log('Raw Medicine Response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      console.log('Medicine API Response Data:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Error fetching medicines');
      }
      
      // Get medicine data from response
      const medicineData = response.data.data || [];
      console.log('Medicine Data:', medicineData);
      
      // Filter out medicines with zero stock
      const availableMedicines = medicineData.filter(med => {
        if (!med) return false;
        const stockLevel = parseInt(med.in_stock_total);
        return !isNaN(stockLevel) && stockLevel > 0;
      });
      
      console.log('Available Medicines:', availableMedicines);
      setMedicines(availableMedicines);
    } catch (error) {
      console.error('Full error object:', error);
      let errorMessage = 'Error loading medicines: ';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        errorMessage += error.response.data?.message || error.message;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error Request:', error.request);
        errorMessage += 'No response received from server';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error Message:', error.message);
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (medicine) => {
    if (!medicine) {
      console.error('No medicine selected');
      return;
    }
    
    console.log('Adding medicine:', medicine);
    
    // Check if medicine is already in the list
    const existingItem = selectedItems.find(item => item.medicine_id === medicine.id);
    if (existingItem) {
      alert('This medicine is already in the bill. Please update the quantity instead.');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        medicine_id: medicine.id,
        name: medicine.name,
        qty: 1,
        unit_price: Number(medicine.sell_price),
        gst: Number(medicine.c_gst) + Number(medicine.s_gst),
        total: Number(medicine.sell_price)
      }
    ]);
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...selectedItems];
    const qty = Number(value);
    const medicine = medicines.find(m => m.id === newItems[index].medicine_id);
    
    if (qty > medicine.in_stock_total) {
      alert(`Only ${medicine.in_stock_total} units available in stock`);
      return;
    }

    newItems[index].qty = qty;
    newItems[index].total = qty * newItems[index].unit_price;
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = selectedItems.reduce((sum, item) => 
      sum + (item.total * item.gst / 100), 0);
    const total = subtotal + gstAmount;

    return { subtotal, gstAmount, total };
  };

  const handleGenerateBill = async () => {
    if (!customerName || !customerPhone || selectedItems.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/generate_bill/', {
        customer_data: {
          name: customerName,
          contact: customerPhone,
          address: customerAddress
        },
        medicine_details: selectedItems.map(item => ({
          medicine_id: item.medicine_id,
          qty: item.qty
        }))
      });

      if (response.data.error === false) {
        // Download PDF immediately after bill generation
        await downloadInvoice(response.data.bill_id);
        setSnackbar({ open: true, message: 'Bill generated successfully!', severity: 'success' });
        resetForm();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error generating bill',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (billId) => {
    try {
      const response = await axiosInstance.get(`/api/bills/${billId}/pdf/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading invoice',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  return (
    <Box sx={{ py: 3 }}>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            component={Link}
            to="/bill-history"
            variant="contained"
            color="primary"
            startIcon={<HistoryIcon />}
          >
            Bill History
          </Button>
        </Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Generate Bill</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Customer Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    inputProps={{
                      maxLength: 10,
                      pattern: "[0-9]*"
                    }}
                  />
                  {customerPhone.length >= 10 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setCustomerName('');
                          setCustomerPhone('');
                          setCustomerAddress('');
                        }}
                      >
                        Clear
                      </Button>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Add Medicines</Typography>
              <Autocomplete
                options={medicines}
                getOptionLabel={(option) => {
                  if (!option || typeof option !== 'object') return '';
                  const name = option.name || 'Unknown Medicine';
                  const stock = option.in_stock_total || 0;
                  const price = option.sell_price || 0;
                  return `${name} - Stock: ${stock} (₹${price})`;
                }}
                onChange={(_, medicine) => medicine && handleAddItem(medicine)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Search Medicine" 
                    fullWidth
                    helperText={
                      loading ? "Loading medicines..." : 
                      medicines.length === 0 ? "No medicines available" :
                      "Search by medicine name"
                    }
                    error={!loading && medicines.length === 0}
                  />
                )}
                renderOption={(props, option) => {
                  if (!option || typeof option !== 'object') return null;
                  return (
                    <Box component="li" {...props}>
                      <div>
                        <Typography variant="body1">{option.name || 'Unknown Medicine'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Stock: {option.in_stock_total || 0} | Price: ₹{option.sell_price || 0}
                        </Typography>
                      </div>
                    </Box>
                  );
                }}
                noOptionsText={loading ? "Loading..." : "No medicines found"}
                loading={loading}
                loadingText="Loading medicines..."
                disabled={loading}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              <TableContainer sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>GST %</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            size="small"
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>₹{item.unit_price}</TableCell>
                        <TableCell>{item.gst}%</TableCell>
                        <TableCell>₹{item.total}</TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Bill Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
                <Typography>GST: ₹{gstAmount.toFixed(2)}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6">
                  Total: ₹{total.toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateBill}
                disabled={loading || selectedItems.length === 0}
              >
                {loading ? 'Generating...' : 'Generate Bill'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GenerateBill; 