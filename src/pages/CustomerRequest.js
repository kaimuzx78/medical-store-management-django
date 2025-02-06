import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CustomerRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    medicine_details: '',
    prescription: null
  });
  const [editId, setEditId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [statusLoading, setStatusLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/customer_request/');
      console.log('Fetch response:', response.data);
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Error response:', error.response?.data);
      alert('Error fetching requests: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('medicine_details', formData.medicine_details);
      if (formData.prescription) {
        formDataToSend.append('prescription', formData.prescription);
      }

      console.log('Submitting form data:', {
        customer_name: formData.customer_name,
        phone: formData.phone,
        medicine_details: formData.medicine_details,
        hasFile: !!formData.prescription
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editId) {
        const response = await axiosInstance.put(
          `/api/customer_request/${editId}/`, 
          formDataToSend,
          config
        );
        console.log('Update response:', response.data);
      } else {
        const response = await axiosInstance.post(
          '/api/customer_request/', 
          formDataToSend,
          config
        );
        console.log('Create response:', response.data);
      }
      
      setFormData({
        customer_name: '',
        phone: '',
        medicine_details: '',
        prescription: null
      });
      setFileName('');
      setEditId(null);
      await fetchRequests();
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      console.error('Error response:', error.response?.data);
      alert('Error submitting request: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request) => {
    setFormData({
      customer_name: request.customer_name,
      phone: request.phone,
      medicine_details: request.medicine_details,
      prescription: request.prescription
    });
    setEditId(request.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const response = await axiosInstance.delete(`/api/customer_request/${id}/`);
        
        if (response.data.error) {
          throw new Error(response.data.message);
        }
        
        await fetchRequests();
        alert('Request deleted successfully');
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Error deleting request: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleStatusChange = async (request) => {
    setStatusLoading(request.id);
    try {
      const response = await axiosInstance.put(
        `/api/customer_request/${request.id}/`,
        {
          status: !request.status
        }
      );

      console.log('Status update response:', response.data);

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      await fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    } finally {
      setStatusLoading(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({
        ...prev,
        prescription: file
      }));
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Customer Requests
      </Typography>
      
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Add New Request
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ 
            display: 'grid', 
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            maxWidth: '800px' // Limit form width
          }}>
            <TextField
              label="Customer Name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="Medicine Details"
              value={formData.medicine_details}
              onChange={(e) => setFormData({ ...formData, medicine_details: e.target.value })}
              required
              multiline
              rows={3}
              sx={{ gridColumn: { sm: '1 / -1' } }}
            />
            <Box sx={{ gridColumn: { sm: '1 / -1' }, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ minWidth: '180px' }}
              >
                Upload Prescription
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </Button>
              {fileName && (
                <Typography variant="body2" color="text.secondary">
                  {fileName}
                </Typography>
              )}
            </Box>
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ minWidth: '150px' }}
              >
                {loading ? <CircularProgress size={24} /> : (editId ? 'Update' : 'Submit')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Medicine Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prescription</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : requests
              ).map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.customer_name}</TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell sx={{ maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {request.medicine_details}
                  </TableCell>
                  <TableCell>
                    {request.prescription && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(request.prescription, '_blank')}
                      >
                        View File
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLoading === request.id ? 'Updating...' : (request.status ? 'Completed' : 'Pending')}
                      color={request.status ? 'success' : 'warning'}
                      onClick={() => handleStatusChange(request)}
                      disabled={statusLoading === request.id}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(request)} 
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(request.id)} 
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={requests.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};

export default CustomerRequest; 