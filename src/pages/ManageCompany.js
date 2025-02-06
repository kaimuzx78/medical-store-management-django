import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import CompanyBankDialog from '../components/CompanyBankDialog';
import axiosInstance from '../utils/axios';

const ManageCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    license_no: '',
    address: '',
    contact_no: '',
    email: '',
    description: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies...');
      const response = await axiosInstance.get('/api/company/');
      console.log('Companies response:', response.data);
      setCompanies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axiosInstance.put(`/api/company/${selectedCompany.id}/`, formData);
      } else {
        await axiosInstance.post('/api/company/', formData);
      }
      setFormData({
        name: '',
        license_no: '',
        address: '',
        contact_no: '',
        email: '',
        description: ''
      });
      setEditMode(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      license_no: company.license_no,
      address: company.address,
      contact_no: company.contact_no,
      email: company.email,
      description: company.description
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const response = await axiosInstance.delete(`/api/company/${id}/`);
        console.log('Delete response:', response);
        if (response.data && !response.data.error) {
          await fetchCompanies();
          alert('Company deleted successfully');
        } else {
          throw new Error(response.data?.message || 'Failed to delete company');
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        if (error.response) {
          console.error('Error response:', error.response);
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        }
        alert(error.response?.data?.message || error.message || 'Error deleting company');
      }
    }
  };

  const handleViewBank = (companyId) => {
    console.log('Viewing bank details for company:', companyId);
    setSelectedCompanyId(companyId);
    setBankDialogOpen(true);
  };

  const handleEditBank = async (bank) => {
    // Implement bank edit functionality
  };

  const handleDeleteBank = async (bankId) => {
    // Implement bank delete functionality
  };

  // Add a debug log to check if component is rendering
  console.log('Rendering ManageCompany component');

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        {/* Add Company Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editMode ? 'Edit Company' : 'Add Company'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License No."
                  name="license_no"
                  value={formData.license_no}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact No."
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  {editMode ? 'Update Company' : 'Add Company'}
                </Button>
                {editMode && (
                  <Button 
                    onClick={() => {
                      setEditMode(false);
                      setSelectedCompany(null);
                      setFormData({
                        name: '',
                        license_no: '',
                        address: '',
                        contact_no: '',
                        email: '',
                        description: ''
                      });
                    }}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Companies List */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Companies
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>License No.</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Added On</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.license_no}</TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>{company.contact_no}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{company.description}</TableCell>
                    <TableCell>{company.added_on}</TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleViewBank(company.id)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleEdit(company)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(company.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Bank Details Dialog */}
        <CompanyBankDialog
          open={bankDialogOpen}
          companyId={selectedCompanyId}
          onClose={() => {
            setBankDialogOpen(false);
            setSelectedCompanyId(null);
          }}
        />
      </Container>
    </Box>
  );
};

export default ManageCompany; 