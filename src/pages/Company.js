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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const Company = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    license_no: '',
    address: '',
    contact_no: '',
    email: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/company/${editingId}/`, formData);
      } else {
        await axiosInstance.post('/api/company/', formData);
      }
      fetchCompanies();
      resetForm();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEdit = (company) => {
    setFormData({
      name: company.name,
      license_no: company.license_no,
      address: company.address,
      contact_no: company.contact_no,
      email: company.email,
      description: company.description,
    });
    setEditingId(company.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await axiosInstance.delete(`/api/company/${id}/`);
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      license_no: '',
      address: '',
      contact_no: '',
      email: '',
      description: '',
    });
    setEditingId(null);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/company/');
      console.log('API Response:', response.data); // Debug log
      setCompanies(response.data.data || []); // Assuming the API returns { data: [...companies] }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Add/Edit Company Form */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {editingId ? 'Edit Company' : 'Add Company'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="License No"
                  name="license_no"
                  value={formData.license_no}
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
                  label="Contact No"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={4}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ flex: 1 }}
                  >
                    {editingId ? 'Update' : 'Add'}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </form>
            </Paper>
          </Grid>

          {/* Companies List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ p: 2 }}>
                All Companies
              </Typography>
              <Divider />
              <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>License No</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(companies) && companies.length > 0 ? (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>{company.name}</TableCell>
                          <TableCell>{company.license_no}</TableCell>
                          <TableCell>{company.contact_no}</TableCell>
                          <TableCell>{company.email}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(company)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(company.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No companies found
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
    </Box>
  );
};

export default Company; 