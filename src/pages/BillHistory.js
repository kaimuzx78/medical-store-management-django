import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [selectedBills, setSelectedBills] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchBills = async () => {
    try {
      const cleanPhone = searchPhone.replace(/\D/g, '');
      
      // Always get last 10 digits for searching
      const last10Digits = cleanPhone.slice(-10);
      
      const params = {
        phone: last10Digits,
        start_date: startDate,
        end_date: endDate
      };
      
      const response = await axiosInstance.get('/api/bill_history/', { params });
      if (response.data && !response.data.error) {
        setBills(response.data.data);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error"
        });
      } else {
        console.error('Error fetching bills:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (billId) => {
    try {
      const response = await axiosInstance.get(`/api/bills/${billId}/pdf/`, {
        responseType: 'blob'  // Important for handling PDF data
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice. Please try again.');
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBills(bills.map(bill => bill.id));
    } else {
      setSelectedBills([]);
    }
  };

  const handleSelectBill = (billId) => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      } else {
        return [...prev, billId];
      }
    });
  };

  const handleDeleteClick = (bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setBillToDelete({ ids: selectedBills });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (Array.isArray(billToDelete.ids)) {
        console.log('Attempting bulk delete:', billToDelete.ids); // Debug log
        const response = await axiosInstance.post('/api/bills/bulk_delete/', {
          bill_ids: billToDelete.ids
        });
        
        if (response.data.error === false) {
          setSelectedBills([]);
          setDeleteDialogOpen(false);
          setBillToDelete(null);
          await fetchBills(); // Refresh the list
          alert(response.data.message || 'Bills deleted successfully');
        } else {
          throw new Error(response.data.message);
        }
      } else {
        console.log('Attempting single delete:', billToDelete.id); // Debug log
        const response = await axiosInstance.delete(`/api/bills/${billToDelete.id}/delete_bill/`);
        
        if (response.data.error === false) {
          setDeleteDialogOpen(false);
          setBillToDelete(null);
          await fetchBills(); // Refresh the list
          alert(response.data.message || 'Bill deleted successfully');
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error deleting bills:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.statusText || 
                          error.message || 
                          'Error deleting bills. Please try again.';
      alert(errorMessage);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(fetchBills, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchPhone, startDate, endDate]);

  return (
    <Box sx={{ py: 3 }}>
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>Bill History</Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by Phone"
                value={searchPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  // Limit to 12 digits
                  if (value.length <= 12) {
                    setSearchPhone(value);
                  }
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                  endAdornment: (
                    <Button 
                      variant="contained"
                      onClick={() => fetchBills()}
                      disabled={!searchPhone}
                    >
                      Search
                    </Button>
                  )
                }}
                helperText="Enter 12 digits (91 + 10 digit mobile number)"
                placeholder="917848787897"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchPhone('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Add Bulk Delete Button */}
        {selectedBills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedBills.length})
            </Button>
          </Box>
        )}

        {loading ? (
          <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={bills.length > 0 && selectedBills.length === bills.length}
                      indeterminate={selectedBills.length > 0 && selectedBills.length < bills.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Bill ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleSelectBill(bill.id)}
                      />
                    </TableCell>
                    <TableCell>#{bill.id}</TableCell>
                    <TableCell>
                      {format(new Date(bill.added_on), 'dd MMM yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{bill.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{bill.customer?.contact || 'N/A'}</TableCell>
                    <TableCell>₹{bill.total_amount ? parseFloat(bill.total_amount).toFixed(2) : '0.00'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => downloadInvoice(bill.id)}
                        >
                          Download Invoice
                        </Button>
                        <Tooltip title="Delete Bill">
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteClick(bill)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {bills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {searchPhone ? (
                        <>
                          No bills found for phone: {searchPhone}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            Note: Searching using last 10 digits of the phone number
                          </Typography>
                        </>
                      ) : (
                        'No bills found'
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {Array.isArray(billToDelete?.ids) ? (
            `Are you sure you want to delete ${billToDelete?.ids.length} bills? This will restore the medicine stock and cannot be undone.`
          ) : (
            `Are you sure you want to delete bill #${billToDelete?.id}? This will restore the medicine stock and cannot be undone.`
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BillHistory; 