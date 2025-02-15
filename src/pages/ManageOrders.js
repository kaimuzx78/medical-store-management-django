import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Badge,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Assessment as StatsIcon,
  TrendingUp as ProfitIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as SalesIcon,
  Receipt,
  Search as SearchIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Clear as ClearIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';

const OrderDetailsDialog = ({ order, open, onClose, onEdit, getStatusColor, getPrescriptionUrl }) => {
  const theme = useTheme();

  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      aria-labelledby="order-details-dialog-title"
      keepMounted={false}
      disablePortal
    >
      <DialogTitle id="order-details-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Order Details #{order?.id}
          </Typography>
          <Tooltip title="Edit Order">
            <IconButton 
              onClick={() => onEdit(order)} 
              size="small"
              aria-label="edit order"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {order && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Customer Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography>{order.patient_name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography>{order.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography>{order.delivery_address}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Order Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateIcon sx={{ color: theme.palette.info.main }} />
                    <Typography>
                      {new Date(order.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon sx={{ color: theme.palette.success.main }} />
                    <Typography>
                      Payment Method: {order.payment_method}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SalesIcon sx={{ color: theme.palette.warning.main }} />
                    <Typography>
                      Total Amount: ₹{order.total_price || 'Pending'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Order Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.neutral }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.neutral }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Quantity
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {order.quantity || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.background.neutral }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Unit Price
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      ₹{order.sell_price || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {order.prescription_url && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Prescription
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Receipt />}
                    href={getPrescriptionUrl(order)}
                    target="_blank"
                  >
                    View Prescription
                  </Button>
                </Box>
              </Grid>
            )}

            {order.admin_note && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Admin Note
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.background.neutral,
                      borderLeft: `4px solid ${theme.palette.primary.main}`
                    }}
                  >
                    <Typography>{order.admin_note}</Typography>
                  </Paper>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditOrderDialog = ({ order, open, onClose, onSave }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({});

  // Initialize form data when dialog opens
  useEffect(() => {
    if (order && open) {
      setFormData({
        patient_name: order.patient_name || '',
        age: order.age || '',
        gender: order.gender || '',
        phone: order.phone || '',
        delivery_address: order.delivery_address || '',
        payment_method: order.payment_method || '',
        status: order.status || '',
        buy_price: order.buy_price || '',
        sell_price: order.sell_price || '',
        quantity: order.quantity || '',
        admin_note: order.admin_note || '',
        description: order.description || ''
      });
    }
  }, [order, open]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        Edit Order #{order?.id}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoFocus
              margin="dense"
              name="patient_name"
              label="Patient Name"
              type="text"
              fullWidth
              value={formData.patient_name || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              name="phone"
              label="Phone"
              type="text"
              fullWidth
              value={formData.phone || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              name="age"
              label="Age"
              type="number"
              fullWidth
              value={formData.age || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="delivery_address"
              label="Delivery Address"
              multiline
              rows={2}
              fullWidth
              value={formData.delivery_address || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || ''}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="payment_method"
                value={formData.payment_method || ''}
                onChange={handleInputChange}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="dense"
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={formData.quantity || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="dense"
              name="buy_price"
              label="Buy Price"
              type="number"
              fullWidth
              value={formData.buy_price || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="dense"
              name="sell_price"
              label="Sell Price"
              type="number"
              fullWidth
              value={formData.sell_price || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="admin_note"
              label="Admin Note"
              multiline
              rows={2}
              fullWidth
              value={formData.admin_note || ''}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="description"
              label="Description"
              multiline
              rows={2}
              fullWidth
              value={formData.description || ''}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ManageOrders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [orderToApprove, setOrderToApprove] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const [totalPrice, setTotalPrice] = useState('');
  const [editForm, setEditForm] = useState({
    patient_name: '',
    age: '',
    gender: '',
    phone: '',
    delivery_address: '',
    payment_method: '',
    status: '',
    buy_price: '',
    sell_price: '',
    quantity: '',
    total_cost: '',
    total_price: '',
    profit: '',
    admin_note: '',
    description: ''
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSales: 0,
    totalProfit: 0,
    todaySales: 0,
    todayProfit: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState('patient_name');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formatNumber = (value) => {
    if (!value || isNaN(value)) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Order ID',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'patient_name',
      headerName: 'Customer Details',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.value}
            </Typography>
          </Box>
          {params.row.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {params.row.phone}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: 'prescription_url',
      headerName: 'Prescription',
      width: 120,
      renderCell: (params) => (
        params.value ? (
          <Button
            size="small"
            variant="outlined"
            href={params.value}
            target="_blank"
            startIcon={<Receipt />}
          >
            View
          </Button>
        ) : (
          <Typography variant="caption" color="textSecondary">
            No prescription
          </Typography>
        )
      ),
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
          <Typography variant="body2">
            {new Date(params.value).toLocaleString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'total_price',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          ₹{params.value ? parseFloat(params.value).toFixed(2) : 'Pending'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton onClick={() => setViewOrder(params.row)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {params.row.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  color="success"
                  onClick={() => handleApprove(params.row)}
                >
                  <ApproveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  color="error"
                  onClick={() => handleReject(params.row)}
                >
                  <RejectIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          {['approved', 'completed'].includes(params.row.status) && (
            <Tooltip title="Print Bill">
              <IconButton
                color="primary"
                onClick={() => handlePrintBill(params.row)}
              >
                <Receipt />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton 
              color="error"
              onClick={() => handleSingleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/orders/');
      console.log('📦 Fetched orders:', {
        count: response.data.data.length,
        firstOrder: response.data.data[0],
        ids: response.data.data.map(o => o.id)
      });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      setLoadingStats(true);
      const response = await axiosInstance.get('/api/admin/orders/stats/');
      if (response.data && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      // Validate required fields for approval
      if (status === 'approved') {
        if (!buyPrice || isNaN(parseFloat(buyPrice)) || parseFloat(buyPrice) <= 0) {
          showSnackbar('Please enter a valid buy price (greater than 0)', 'error');
          return;
        }
        if (!sellPrice || isNaN(parseFloat(sellPrice)) || parseFloat(sellPrice) <= 0) {
          showSnackbar('Please enter a valid sell price (greater than 0)', 'error');
          return;
        }
        if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
          showSnackbar('Please enter a valid quantity (greater than 0)', 'error');
          return;
        }
      }

      setUpdating(true);
      
      const payload = {
        status,
        admin_note: adminNote,
      };

      if (status === 'approved') {
        payload.buy_price = parseFloat(buyPrice);
        payload.sell_price = parseFloat(sellPrice);
        payload.quantity = parseInt(quantity);
      }

      // Use the correct endpoint for order update
      const response = await axiosInstance.put(
        `/api/admin/orders/${orderId}/`,
        payload
      );

      if (response.data && !response.data.error) {
        // Update the order in the local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, ...response.data.data } : order
        ));
        
        showSnackbar(`Order ${status} successfully!`);
        handleCloseApproval();
        fetchOrderStats();
      } else {
        throw new Error(response.data?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      showSnackbar(
        error.response?.data?.message || error.message || 'Failed to update order status',
        'error'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axiosInstance.post('/api/admin/orders/bulk-delete/', {
        order_ids: selectedRows
      });

      // Update local state by removing deleted orders
      setOrders(prevOrders => 
        prevOrders.filter(order => !selectedRows.includes(order.id))
      );

      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalOrders: prevStats.totalOrders - selectedRows.length,
        pendingOrders: prevStats.pendingOrders - 
          orders.filter(o => selectedRows.includes(o.id) && o.status === 'pending').length
      }));

      setSelectedRows([]);
      showSnackbar('Orders deleted successfully');
    } catch (error) {
      console.error('Error deleting orders:', error);
      showSnackbar('Failed to delete orders', 'error');
    }
  };

  const handleSingleDelete = (orderId) => {
    setSelectedRows([orderId]);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/api/admin/orders/bulk-delete/', {
        order_ids: selectedRows
      });
      
      // Update orders list immediately
      setOrders(prevOrders => 
        prevOrders.filter(order => !selectedRows.includes(order.id))
      );
      
      // Update stats
      setStats(prevStats => {
        const deletedOrders = orders.filter(order => selectedRows.includes(order.id));
        const pendingCount = deletedOrders.filter(o => o.status === 'pending').length;
        const completedCount = deletedOrders.filter(o => o.status === 'completed').length;
        const deletedSales = deletedOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
        const deletedProfit = deletedOrders.reduce((sum, o) => 
          sum + ((parseFloat(o.sell_price) || 0) - (parseFloat(o.buy_price) || 0)), 0
        );

        return {
          ...prevStats,
          totalOrders: prevStats.totalOrders - selectedRows.length,
          pendingOrders: prevStats.pendingOrders - pendingCount,
          completedOrders: prevStats.completedOrders - completedCount,
          totalSales: prevStats.totalSales - deletedSales,
          totalProfit: prevStats.totalProfit - deletedProfit
        };
      });

      showSnackbar(`Successfully deleted ${selectedRows.length} order(s)`);
      setSelectedRows([]);
    } catch (error) {
      showSnackbar('Failed to delete orders', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(parseFloat(price))) return 'Pending';
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const handleEdit = (order) => {
    setEditForm({
      patient_name: order.patient_name || '',
      age: order.age?.toString() || '',
      gender: order.gender || '',
      phone: order.phone || '',
      delivery_address: order.delivery_address || '',
      payment_method: order.payment_method || '',
      buy_price: order.buy_price?.toString() || '',
      sell_price: order.sell_price?.toString() || '',
      quantity: order.quantity?.toString() || '',
      admin_note: order.admin_note || '',
      description: order.description || ''
    });
    setEditMode(true);
    setSelectedOrder(order);
  };

  const handleSaveEdit = async (formData) => {
    try {
      setUpdating(true);

      // Validate numeric fields
      const numericErrors = [];
      
      if (!/^\d+(\.\d{1,2})?$/.test(formData.buy_price)) {
        numericErrors.push('Invalid buy price');
      }
      if (!/^\d+(\.\d{1,2})?$/.test(formData.sell_price)) {
        numericErrors.push('Invalid sell price');
      }
      if (!/^\d+$/.test(formData.quantity)) {
        numericErrors.push('Quantity must be whole number');
      }
      
      if (numericErrors.length > 0) {
        showSnackbar(numericErrors.join(', '), 'error');
        return;
      }

      // Convert numeric values
      const payload = {
        ...formData,
        buy_price: parseFloat(formData.buy_price),
        sell_price: parseFloat(formData.sell_price),
        quantity: parseInt(formData.quantity),
        age: parseInt(formData.age) || 0
      };

      // Calculate derived fields
      payload.total_cost = payload.buy_price * payload.quantity;
      payload.total_price = payload.sell_price * payload.quantity;
      payload.profit = payload.total_price - payload.total_cost;

      const response = await axiosInstance.put(
        `/api/admin/orders/${selectedOrder.id}/`, 
        payload
      );

      if (response.data?.error === false) {
        setOrders(prev => prev.map(order => 
          order.id === selectedOrder.id ? { ...order, ...payload } : order
        ));
        setEditMode(false);
        setSelectedOrder(null);
        fetchOrderStats(); // Refresh dashboard stats
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Update failed. Check console for details.', 'error');
      console.error('Update error:', error.response);
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    setAdminNote('');
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
  };

  const handleCloseEdit = () => {
    setEditMode(false);
    setSelectedOrder(null);
    setEditForm({
      patient_name: '',
      age: '',
      gender: '',
      phone: '',
      delivery_address: '',
      payment_method: '',
      buy_price: '',
      sell_price: '',
      quantity: '',
      admin_note: '',
      description: ''
    });
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 20px ${theme.palette[color].main}20`,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette[color].lighter,
              color: theme.palette[color].main,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const OrderStatusSummary = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Order Status Summary</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="textSecondary">Today's Sales</Typography>
            <Typography variant="h6">
              {loadingStats ? (
                <CircularProgress size={20} />
              ) : (
                `₹${stats.todaySales?.toFixed(2) || '0.00'}`
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="textSecondary">Today's Profit</Typography>
            <Typography variant="h6">
              {loadingStats ? (
                <CircularProgress size={20} />
              ) : (
                `₹${stats.todayProfit?.toFixed(2) || '0.00'}`
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="textSecondary">Completed Orders</Typography>
            <Typography variant="h6">
              {loadingStats ? (
                <CircularProgress size={20} />
              ) : (
                stats.completedOrders || 0
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    switch (searchBy) {
      case 'patient_name':
        return order.patient_name?.toLowerCase().includes(searchLower);
      case 'phone':
        return order.phone?.includes(searchQuery);
      case 'order_id':
        return order.id.toString().includes(searchQuery);
      case 'status':
        return order.status?.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Box
        sx={{
          p: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TextField
          size="small"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            label="Search By"
          >
            <MenuItem value="patient_name">Customer Name</MenuItem>
            <MenuItem value="phone">Phone</MenuItem>
            <MenuItem value="order_id">Order ID</MenuItem>
            <MenuItem value="status">Status</MenuItem>
          </Select>
        </FormControl>
        {selectedRows.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedRows.length})
          </Button>
        )}
      </Box>
    </GridToolbarContainer>
  );

  const handleApprove = (order) => {
    setOrderToApprove(order);
    setApprovalDialogOpen(true);
    // Ensure edit dialog is closed
    setEditMode(false);
    setSelectedOrder(null);
    // Initialize form fields with order data
    setBuyPrice(order.buy_price || '');
    setSellPrice(order.sell_price || '');
    setQuantity(order.quantity || '');
    setAdminNote('');
  };

  const handleReject = (order) => {
    setOrderToApprove(order);
    setApprovalDialogOpen(true);
    // Ensure edit dialog is closed
    setEditMode(false);
    setSelectedOrder(null);
  };

  const handlePrintBill = async (order) => {
    try {
      const response = await axiosInstance.get(`/api/admin/orders/${order.id}/bill/`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf,*/*'
        }
      });

      // Create blob from array buffer
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      
      const printWindow = window.open(pdfUrl, '_blank');
      if (!printWindow) {
        showSnackbar('Please allow popups to view the bill', 'error');
      }
      
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Bill generation failed:', error);
      let errorMessage = 'Failed to generate bill. Please try again.';
      if (error.response?.data) {
        try {
          const decoder = new TextDecoder('utf-8');
          const errorData = JSON.parse(decoder.decode(error.response.data));
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Keep default error message if parsing fails
        }
      }
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleCloseApproval = () => {
    setApprovalDialogOpen(false);
    setOrderToApprove(null);
    // Clear form fields
    setAdminNote('');
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'primary',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getPrescriptionUrl = (order) => {
    if (!order?.prescription_url) return null;
    if (order.prescription_url.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL}${order.prescription_url}`;
    }
    return order.prescription_url;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Title Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main, borderLeft: `4px solid ${theme.palette.primary.main}`, paddingLeft: 2 }}>
          Manage Medicine Orders
        </Typography>
      </Box>

      {/* Today's Summary */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.primary.lighter} 90%)`, }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Today's Sales
              </Typography>
              <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                {loadingStats ? (
                  <CircularProgress size={20} />
                ) : (
                  `₹${stats.todaySales?.toFixed(2) || '0.00'}`
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Today's Profit
              </Typography>
              <Typography variant="h5" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                {loadingStats ? (
                  <CircularProgress size={20} />
                ) : (
                  `₹${stats.todayProfit?.toFixed(2) || '0.00'}`
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Completed Orders
              </Typography>
              <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                {loadingStats ? (
                  <CircularProgress size={20} />
                ) : (
                  stats.completedOrders || 0
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<OrdersIcon />}
            title="Total Orders"
            value={stats.totalOrders}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<SalesIcon />}
            title="Total Sales"
            value={`₹${stats.totalSales?.toFixed(2) || '0.00'}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<ProfitIcon />}
            title="Total Profit"
            value={`₹${stats.totalProfit?.toFixed(2) || '0.00'}`}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<StatsIcon />}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="error"
          />
        </Grid>
      </Grid>

      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DataGrid
          rows={filteredOrders}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
          autoHeight
          components={{
            Toolbar: CustomToolbar
          }}
          onSelectionModelChange={setSelectedRows}
          selectionModel={selectedRows}
          getRowId={(row) => row.id}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.background.neutral,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: `${theme.palette.primary.lighter} !important`,
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: `${theme.palette.primary.lighter} !important`,
            },
          }}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <EditOrderDialog
          order={selectedOrder}
          open={editMode}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />

        <OrderDetailsDialog
          order={viewOrder}
          open={!!viewOrder}
          onClose={() => setViewOrder(null)}
          onEdit={(order) => {
            setViewOrder(null);
            handleEdit(order);
          }}
          getStatusColor={getStatusColor}
          getPrescriptionUrl={getPrescriptionUrl}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedRows.length} order(s)?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Order Status Update Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={handleCloseApproval}
        aria-labelledby="order-status-dialog-title"
        keepMounted={false}
        disablePortal
      >
        <DialogTitle id="order-status-dialog-title">
          Approve Order
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Admin Note"
              multiline
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Buy Price"
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Sell Price"
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproval} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={() => handleStatusUpdate(orderToApprove?.id, 'approved')}
            variant="contained"
            color="success"
            disabled={updating}
          >
            {updating ? (
              <CircularProgress size={24} />
            ) : (
              'Approve Order'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageOrders; 