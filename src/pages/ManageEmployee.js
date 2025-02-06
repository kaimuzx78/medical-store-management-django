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
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../utils/axios';

const ManageEmployee = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    joining_date: null,
    phone: '',
    address: '',
    salary: '',
  });
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      joining_date: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First save employee data
      const employeeData = {
        name: formData.name,
        joining_date: formData.joining_date?.toISOString().split('T')[0],
        phone: formData.phone,
        address: formData.address,
      };

      let employeeId;
      if (formData.id) {
        const response = await axiosInstance.put(`/api/employee/${formData.id}/`, employeeData);
        employeeId = formData.id;
      } else {
        // Add console.log to check response structure
        const response = await axiosInstance.post('/api/employee/', employeeData);
        console.log('Employee creation response:', response);
        
        // Handle different response structures
        if (response.data.error === false) {
          // If the response has a data property containing the employee details
          employeeId = response.data.data?.id;
        } else {
          throw new Error('Failed to create employee');
        }
      }

      // Then save salary data if salary is provided and we have an employeeId
      if (formData.salary && employeeId) {
        const salaryData = {
          employee_id: employeeId,
          salary_date: new Date().toISOString().split('T')[0],
          salary_amount: formData.salary.toString()
        };

        console.log('Saving salary data:', salaryData);
        const salaryResponse = await axiosInstance.post('/api/employee_all_salary/', salaryData);
        console.log('Salary response:', salaryResponse);
      }

      await fetchEmployees();
      resetForm();
      alert('Employee saved successfully!');
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'Error saving employee';
      alert('Error saving employee: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      ...employee,
      joining_date: employee.joining_date ? new Date(employee.joining_date) : null,
    });
    setEditDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axiosInstance.delete(`/api/employee/${id}/`);
        await fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            'Unknown error occurred';
        alert('Error deleting employee: ' + errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      joining_date: null,
      phone: '',
      address: '',
      salary: '',
    });
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Get employees
      const employeeResponse = await axiosInstance.get('/api/employee/');
      console.log('Employee Response:', employeeResponse.data);
      
      const employeesData = employeeResponse.data.data || [];
      
      // Get all employee salaries
      const salaryPromises = employeesData.map(emp => 
        axiosInstance.get(`/api/employee_salaryby_id/${emp.id}`)
      );
      
      const salaryResponses = await Promise.all(salaryPromises);
      console.log('Salary Responses:', salaryResponses);

      // Combine employee and salary data
      const formattedEmployees = employeesData.map((emp, index) => {
        const salaryData = salaryResponses[index].data;
        const latestSalary = Array.isArray(salaryData) && salaryData.length > 0 
          ? salaryData[salaryData.length - 1].salary_amount 
          : '0';
        
        return {
          ...emp,
          salary: latestSalary
        };
      });

      console.log('Formatted Employees:', formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Bank Account Dialog
  const BankAccountDialog = ({ open, onClose, employeeId }) => {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      bank_account_no: '',
      ifsc_no: ''
    });

    // Fetch bank accounts when dialog opens
    useEffect(() => {
      if (open && employeeId) {
        fetchBankAccounts();
      }
    }, [open, employeeId]);

    const fetchBankAccounts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/employee_bankby_id/${employeeId}`);
        console.log('Bank accounts response:', response.data);
        setBankAccounts(response.data || []);
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        alert('Error fetching bank accounts');
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axiosInstance.post('/api/employee_all_bank/', {
          ...formData,
          employee_id: employeeId
        });
        if (response.data && !response.data.error) {
          alert('Bank account added successfully');
          setFormData({ bank_account_no: '', ifsc_no: '' }); // Reset form
          await fetchBankAccounts(); // Refresh the list
        }
      } catch (error) {
        console.error('Error adding bank account:', error);
        alert(error.response?.data?.message || 'Error adding bank account');
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Employee Bank Accounts</DialogTitle>
        <DialogContent>
          {/* Add Bank Account Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="bank_account_no"
                  value={formData.bank_account_no}
                  onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  name="ifsc_no"
                  value={formData.ifsc_no}
                  onChange={(e) => setFormData({ ...formData, ifsc_no: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  sx={{ height: '100%' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Bank Accounts List */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Number</TableCell>
                  <TableCell>IFSC Code</TableCell>
                  <TableCell>Added On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : bankAccounts.length > 0 ? (
                  bankAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.bank_account_no}</TableCell>
                      <TableCell>{account.ifsc_no}</TableCell>
                      <TableCell>
                        {new Date(account.added_on).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="error"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this bank account?')) {
                              try {
                                const response = await axiosInstance.delete(`/api/employee_all_bank/${account.id}/`);
                                if (response.data && !response.data.error) {
                                  await fetchBankAccounts();
                                  alert('Bank account deleted successfully');
                                } else {
                                  throw new Error(response.data?.message || 'Failed to delete bank account');
                                }
                              } catch (error) {
                                console.error('Error deleting bank account:', error);
                                alert(error.response?.data?.message || error.message || 'Error deleting bank account');
                              }
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No bank accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Rename SalaryDialog to SalaryHistoryDialog
  const SalaryHistoryDialog = ({ open, onClose, employeeId }) => {
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && employeeId) {
            fetchSalaryHistory();
        }
    }, [open, employeeId]);

    const fetchSalaryHistory = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/employee_salaryby_id/${employeeId}`);
            console.log('Salary history response:', response.data);
            setSalaryHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching salary history:', error);
            alert('Error fetching salary history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Employee Salary History</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Salary Amount</TableCell>
                                <TableCell>Added On</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : salaryHistory.length > 0 ? (
                                salaryHistory.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            {new Date(record.salary_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            ₹{Number(record.salary_amount).toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(record.added_on).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No salary history found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Add Employee Form */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Add Employee
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Joining Date"
                    value={formData.joining_date}
                    onChange={handleDateChange}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        margin: 'normal',
                        required: true 
                      } 
                    }}
                  />
                </LocalizationProvider>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
                <TextField
                  fullWidth
                  label="Salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Salary input value:', value, typeof value);
                    setFormData({
                      ...formData,
                      salary: value
                    });
                  }}
                  margin="normal"
                  required
                  inputProps={{ 
                    min: "0",
                    step: "0.01"
                  }}
                  helperText="Enter salary amount (e.g., 25000.00)"
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  {formData.id ? 'Update Employee' : 'Add Employee'}
                </Button>
              </form>
            </Paper>
          </Grid>

          {/* Employees List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ p: 2 }}>
                All Employees
              </Typography>
              <Divider />
              <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Joining Date</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Salary</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : employees.length > 0 ? (
                      employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>
                            {new Date(employee.joining_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{employee.phone}</TableCell>
                          <TableCell>{employee.address}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`₹${(() => {
                                const salary = Number(employee.salary || 0);
                                return !isNaN(salary) && salary > 0 ? 
                                  salary.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }) : 
                                  '0.00';
                              })()}`}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(employee)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(employee.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedEmployeeId(employee.id);
                                setBankDialogOpen(true);
                              }}
                            >
                              <AccountBalanceIcon />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedEmployeeId(employee.id);
                                setSalaryDialogOpen(true);
                              }}
                              title="View Salary History"
                            >
                              <PaymentIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No employees found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      {/* Add dialogs */}
      <BankAccountDialog
        open={bankDialogOpen}
        onClose={() => setBankDialogOpen(false)}
        employeeId={selectedEmployeeId}
      />
      <SalaryHistoryDialog
        open={salaryDialogOpen}
        onClose={() => setSalaryDialogOpen(false)}
        employeeId={selectedEmployeeId}
      />
    </Box>
  );
};

export default ManageEmployee; 