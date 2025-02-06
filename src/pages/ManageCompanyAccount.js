import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../utils/axios';

const ManageCompanyAccount = () => {
  const [companies, setCompanies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    company_id: '',
    transaction_type: '',
    amount: '',
    transaction_date: null,
    payment_mode: '',
  });

  useEffect(() => {
    fetchCompanies();
    fetchTransactions();

    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies...');
      const response = await axiosInstance.get('/api/company/');
      console.log('Companies response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCompanies(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCompanies(response.data.data);
      } else {
        console.error('Invalid companies data format:', response.data);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error.response?.data || error);
      setCompanies([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const response = await axiosInstance.get('/api/companyaccount/');
      console.log('Raw Transactions response:', response);
      console.log('Transactions data:', response.data);

      const transactionsData = response.data.data || response.data;

      if (Array.isArray(transactionsData)) {
        const formattedTransactions = transactionsData.map(transaction => {
          console.log('Processing transaction:', transaction);
          
          // Ensure transaction_type is a string and properly formatted
          let transactionType = 'N/A';
          if (transaction.transaction_type) {
            transactionType = String(transaction.transaction_type).trim();
          }

          return {
            id: transaction.id,
            company_name: transaction.company?.name || transaction.company_name || 'N/A',
            company_id: transaction.company?.id || transaction.company_id || 'N/A',
            transaction_type: transactionType,
            amount: transaction.amount || 0,
            transaction_date: transaction.transaction_date || transaction.date,
            payment_mode: transaction.payment_mode || transaction.mode || 'N/A',
            created_at: transaction.created_at || transaction.added_on || new Date().toISOString()
          };
        });

        console.log('Formatted transactions:', formattedTransactions);
        setTransactions(formattedTransactions);
      } else {
        console.error('Invalid transactions data format:', response.data);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error.response?.data || error);
      setTransactions([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      transaction_date: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedData = {
        company_id: parseInt(formData.company_id),
        transaction_type: formData.transaction_type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date?.toISOString().split('T')[0],
        payment_mode: formData.payment_mode
      };
      
      console.log('Submitting transaction data:', formattedData);
      const response = await axiosInstance.post('/api/companyaccount/', formattedData);
      console.log('Transaction creation response:', response.data);

      if (response.data) {
        alert('Transaction added successfully!');
        // Force immediate refresh
        setTimeout(() => {
          fetchTransactions();
        }, 500); // Add small delay to allow server to process
        
        setFormData({
          company_id: '',
          transaction_type: '',
          amount: '',
          transaction_date: null,
          payment_mode: '',
        });
      }
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Error adding transaction: ';
      if (error.response?.status === 404) {
        errorMessage += 'API endpoint not found. Please check the server configuration.';
      } else if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data);
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Add Company Account Bill
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    label="Company"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleChange}
                    label="Transaction Type"
                  >
                    <MenuItem value="Credit">Credit</MenuItem>
                    <MenuItem value="Debit">Debit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Transaction Date"
                    value={formData.transaction_date}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleChange}
                    label="Payment Mode"
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Adding...' : 'Add Transaction'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            All Companies Account Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#ID</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Company ID</TableCell>
                  <TableCell>Transaction Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment Mode</TableCell>
                  <TableCell>Added On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id || 'N/A'}</TableCell>
                      <TableCell>{transaction.company_name || 'N/A'}</TableCell>
                      <TableCell>{transaction.company_id || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.transaction_type}
                          color={transaction.transaction_type === 'Credit' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        ₹{transaction.amount ? parseFloat(transaction.amount).toLocaleString('en-IN') : '0'}
                      </TableCell>
                      <TableCell>
                        {transaction.transaction_date ? 
                          new Date(transaction.transaction_date).toLocaleDateString('en-IN') : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>{transaction.payment_mode || 'N/A'}</TableCell>
                      <TableCell>
                        {transaction.created_at ? 
                          new Date(transaction.created_at).toLocaleString('en-IN') : 
                          'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                {(!transactions || transactions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {loading ? 'Loading transactions...' : 'No transactions found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={transactions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ManageCompanyAccount; 