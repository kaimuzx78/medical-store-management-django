import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const CompanyBankDialog = ({ open, companyId, onClose }) => {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bank_account_no: '',
    ifsc_no: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    if (open && companyId) {
      fetchBankDetails();
    }
  }, [open, companyId]);

  const fetchBankDetails = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      console.log('Fetching bank details for company:', companyId);
      const response = await axiosInstance.get('/api/companybank/');
      console.log('Bank details response:', response.data);
      
      const companyBanks = response.data.data.filter(bank => bank.company_id === companyId);
      setBankDetails(companyBanks || []);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      alert(error.message || 'Error fetching bank details');
    } finally {
      setLoading(false);
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
      const data = {
        bank_account_no: formData.bank_account_no,
        ifsc_no: formData.ifsc_no,
        company_id: companyId
      };

      let response;
      if (editMode && selectedBank) {
        response = await axiosInstance.put(
          `/api/companybank/${selectedBank.id}/`,
          data
        );
      } else {
        response = await axiosInstance.post(
          '/api/companybank/',
          data
        );
      }

      if (response.data && !response.data.error) {
        await fetchBankDetails();
        resetForm();
        alert(response.data.message || (editMode ? 'Bank account updated successfully' : 'Bank account added successfully'));
      } else {
        throw new Error(response.data?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving bank details:', error);
      alert(error.message || 'Error saving bank details');
    }
  };

  const handleEdit = (bank) => {
    setSelectedBank(bank);
    setFormData({
      bank_account_no: bank.bank_account_no,
      ifsc_no: bank.ifsc_no
    });
    setEditMode(true);
  };

  const handleDelete = async (bankId) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
        try {
            // Add proper error handling for the response
            const response = await axiosInstance.delete(`/api/companybank/${bankId}/`);
            if (response.data && !response.data.error) {
                await fetchBankDetails();
                alert('Bank account deleted successfully');
            } else {
                throw new Error(response.data?.message || 'Failed to delete bank account');
            }
        } catch (error) {
            console.error('Error deleting bank account:', error);
            alert(error.response?.data?.message || error.message || 'Error deleting bank account');
        }
    }
  };

  const resetForm = () => {
    setFormData({
      bank_account_no: '',
      ifsc_no: ''
    });
    setEditMode(false);
    setSelectedBank(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Company Bank Accounts</DialogTitle>
      <DialogContent>
        {/* Add/Edit Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Account Number"
              name="bank_account_no"
              value={formData.bank_account_no}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="IFSC Code"
              name="ifsc_no"
              value={formData.ifsc_no}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<Add />}
            >
              {editMode ? 'Update' : 'Add'}
            </Button>
            {editMode && (
              <Button 
                onClick={resetForm}
                variant="outlined"
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>

        {/* Bank Accounts Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#ID</TableCell>
                <TableCell>Account No.</TableCell>
                <TableCell>IFSC Code</TableCell>
                <TableCell>Added On</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading...</TableCell>
                </TableRow>
              ) : bankDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No bank accounts found</TableCell>
                </TableRow>
              ) : (
                bankDetails.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell>{bank.id}</TableCell>
                    <TableCell>{bank.bank_account_no}</TableCell>
                    <TableCell>{bank.ifsc_no}</TableCell>
                    <TableCell>{bank.added_on}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(bank)}>
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(bank.id)}>
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyBankDialog; 