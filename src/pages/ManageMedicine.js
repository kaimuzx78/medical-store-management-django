import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  TablePagination,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import EditMedicineDialog from '../components/EditMedicineDialog';
import { useNavigate } from 'react-router-dom';

const ManageMedicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const [editDialog, setEditDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchMedicines();
    fetchCompanies();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/medicine/');
      console.log('Medicines API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setMedicines(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setMedicines(response.data.data);
      } else {
        console.error('Invalid medicines data format:', response.data);
        setMedicines([]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/api/company/');
      if (response.data && Array.isArray(response.data)) {
        setCompanies(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
        try {
            const response = await axiosInstance.delete(`/api/medicine/${id}/`);
            if (response.data && !response.data.error) {
                await fetchMedicines();
                alert('Medicine deleted successfully');
            } else {
                throw new Error(response.data?.message || 'Failed to delete medicine');
            }
        } catch (error) {
            console.error('Error deleting medicine:', error);
            alert(error.response?.data?.message || error.message || 'Failed to delete medicine');
        }
    }
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setEditDialog(true);
  };

  const handleSaveEdit = async (updatedMedicine) => {
    try {
        const response = await axiosInstance.put(`/api/medicine/${updatedMedicine.id}/`, updatedMedicine);
        if (response.data && !response.data.error) {
            setEditDialog(false);
            setSelectedMedicine(null);
            await fetchMedicines();
            alert('Medicine updated successfully');
        } else {
            throw new Error(response.data?.message || 'Failed to update medicine');
        }
    } catch (error) {
        console.error('Error updating medicine:', error);
        alert(error.response?.data?.message || error.message || 'Failed to update medicine');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredMedicines = Array.isArray(medicines) ? medicines.filter((medicine) =>
    medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine?.medical_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const isExpiringSoon = (expireDate) => {
    const today = new Date();
    const expiry = new Date(expireDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expireDate) => {
    const today = new Date();
    const expiry = new Date(expireDate);
    return expiry < today;
  };

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Manage Medicines
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add-medicine')}
              >
                Add Medicine
              </Button>
              <TextField
                size="small"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Expire Date</TableCell>
                  <TableCell>Buy Price</TableCell>
                  <TableCell>Sell Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading medicines...
                    </TableCell>
                  </TableRow>
                ) : filteredMedicines.length > 0 ? (
                  filteredMedicines
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((medicine) => (
                      <TableRow key={medicine.id || medicine._id}>
                        <TableCell>{medicine.name || 'N/A'}</TableCell>
                        <TableCell>{medicine.medical_type || 'N/A'}</TableCell>
                        <TableCell>{medicine.company_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={medicine.in_stock_total || 0}
                            color={medicine.in_stock_total < 10 ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {medicine.expire_date || 'N/A'}
                            {medicine.expire_date && isExpired(medicine.expire_date) && (
                              <Tooltip title="Expired">
                                <WarningIcon color="error" fontSize="small" />
                              </Tooltip>
                            )}
                            {medicine.expire_date && isExpiringSoon(medicine.expire_date) && (
                              <Tooltip title="Expiring Soon">
                                <WarningIcon color="warning" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>₹{medicine.buy_price || 0}</TableCell>
                        <TableCell>₹{medicine.sell_price || 0}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(medicine)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(medicine.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No medicines found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredMedicines.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />

          <EditMedicineDialog
            open={editDialog}
            medicine={selectedMedicine}
            companies={companies}
            onClose={() => {
              setEditDialog(false);
              setSelectedMedicine(null);
            }}
            onSave={handleSaveEdit}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ManageMedicine; 