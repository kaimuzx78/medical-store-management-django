import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [totalPrice, setTotalPrice] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    patient_name: '',
    age: '',
    gender: '',
    phone: '',
    delivery_address: '',
    payment_method: '',
    total_price: '',
    status: '',
    admin_note: ''
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
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/orders/');
      setOrders(response.data.data || []);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error:', error);
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/api/admin/orders/${orderId}/`, {
        status: newStatus,
        admin_note: adminNote,
        buy_price: buyPrice,
        sell_price: sellPrice,
        quantity: quantity,
        total_cost: buyPrice * quantity,
        total_price: sellPrice * quantity,
        profit: (sellPrice * quantity) - (buyPrice * quantity)
      });
      await Promise.all([
        fetchOrders(),
        fetchOrderStats()
      ]);
      setSelectedOrder(null);
      setAdminNote('');
      setBuyPrice('');
      setSellPrice('');
      setQuantity('');
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axiosInstance.post('/api/admin/orders/bulk-delete/', {
        order_ids: selectedOrders
      });
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      setError('Failed to delete orders');
    }
  };

  const getStatusChipColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'primary',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const formatPrice = (price) => {
    if (!price || isNaN(parseFloat(price))) return 'Pending';
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const getPrescriptionUrl = (order) => {
    if (!order.prescription_url) return null;
    // If the URL is relative, prepend the base URL
    if (order.prescription_url.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL}${order.prescription_url}`;
    }
    return order.prescription_url;
  };

  const handleEdit = (order) => {
    setEditForm({
      patient_name: order.patient_name || '',
      age: order.age || '',
      gender: order.gender || '',
      phone: order.phone || '',
      delivery_address: order.delivery_address || '',
      payment_method: order.payment_method || '',
      buy_price: order.buy_price || '',
      sell_price: order.sell_price || '',
      quantity: order.quantity || '',
      status: order.status || '',
      admin_note: order.admin_note || '',
      total_cost: order.total_cost || '',
      total_price: order.total_price || '',
      profit: order.profit || ''
    });
    setEditMode(true);
    setViewOrder(order);
  };

  const handleEditSubmit = async () => {
    try {
      // Calculate totals based on current values
      const quantity = parseInt(editForm.quantity) || 0;
      const buy_price = parseFloat(editForm.buy_price) || 0;
      const sell_price = parseFloat(editForm.sell_price) || 0;
      const total_cost = buy_price * quantity;
      const total_price = sell_price * quantity;
      const profit = total_price - total_cost;

      const formData = {
        ...editForm,
        buy_price,
        sell_price,
        quantity,
        total_cost,
        total_price,
        profit
      };

      console.log('Submitting edit form:', formData);  // Debug log

      const response = await axiosInstance.put(`/api/admin/orders/${viewOrder.id}/edit/`, formData);
      
      if (response.data.error) {
        throw new Error(response.data.message);
      }

      await Promise.all([
        fetchOrders(),
        fetchOrderStats()
      ]);
      
      setEditMode(false);
      setViewOrder(null);
      setError('');  // Clear any existing errors
    } catch (error) {
      console.error('Edit submission error:', error);  // Debug log
      setError(error.response?.data?.message || 'Failed to update order');
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {loadingStats ? (
                <CircularProgress size={20} />
              ) : (
                typeof value === 'number' && title.includes('₹') 
                  ? `₹${value.toFixed(2)}`
                  : value
              )}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              backgroundColor: `${color}.lighter`,
              p: 1,
              borderRadius: 1
            }}
          >
            {icon}
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

  // Helper function to format numbers
  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<OrdersIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Sales (₹)"
            value={formatNumber(stats.totalSales)}
            icon={<SalesIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Profit (₹)"
            value={formatNumber(stats.totalProfit)}
            icon={<ProfitIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<StatsIcon sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
      </Grid>

      <OrderStatusSummary />

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Manage Medicine Orders</Typography>
          {selectedOrders.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedOrders.length})
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(orders.map(order => order.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Prescription</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.patient_name}</TableCell>
                  <TableCell>
                    {order.phone}<br/>
                    <Typography variant="caption" color="textSecondary">
                      {order.delivery_address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.prescription_url ? (
                      <Button
                        size="small"
                        variant="outlined"
                        href={getPrescriptionUrl(order)}
                        target="_blank"
                      >
                        View
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No prescription
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(order.total_price)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusChipColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setViewOrder(order)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {order.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedOrder(order);
                                setAdminNote('');
                              }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedOrder({ ...order, reject: true });
                                setAdminNote('');
                              }}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Edit Order">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(order)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
          <DialogTitle>
            {selectedOrder?.reject ? 'Reject Order' : 'Approve Order'}
          </DialogTitle>
          <DialogContent>
            {!selectedOrder?.reject && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Buy Price (per unit)"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      sx={{ mt: 2 }}
                      required
                      InputProps={{
                        startAdornment: <span>₹</span>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Sell Price (per unit)"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      sx={{ mt: 2 }}
                      required
                      InputProps={{
                        startAdornment: <span>₹</span>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      sx={{ mt: 2 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>Order Summary</Typography>
                      <Typography>Total Cost: ₹{(buyPrice * quantity).toFixed(2)}</Typography>
                      <Typography>Total Price: ₹{(sellPrice * quantity).toFixed(2)}</Typography>
                      <Typography>Profit: ₹{((sellPrice * quantity) - (buyPrice * quantity)).toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Admin Note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setSelectedOrder(null);
              setBuyPrice('');
              setSellPrice('');
              setQuantity('');
              setAdminNote('');
            }}>Cancel</Button>
            <Button 
              onClick={() => handleStatusUpdate(
                selectedOrder.id, 
                selectedOrder.reject ? 'rejected' : 'approved'
              )}
              color={selectedOrder?.reject ? 'error' : 'success'}
              disabled={(!adminNote) || (!selectedOrder?.reject && !buyPrice && !sellPrice && !quantity)}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!viewOrder} onClose={() => {
          setViewOrder(null);
          setEditMode(false);
        }} maxWidth="md" fullWidth>
          <DialogTitle>
            Order Details #{viewOrder?.id}
            {!editMode && (
              <IconButton
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={() => handleEdit(viewOrder)}
              >
                <EditIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent>
            {viewOrder && (
              <Box sx={{ mt: 2 }}>
                {!editMode ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom>Patient Information</Typography>
                    <Typography>Name: {viewOrder.patient_name}</Typography>
                    <Typography>Age: {viewOrder.age || 'Not specified'}</Typography>
                    <Typography>Gender: {viewOrder.gender || 'Not specified'}</Typography>
                    <Typography>Phone: {viewOrder.phone}</Typography>
                    <Typography>Address: {viewOrder.delivery_address}</Typography>

                    <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Order Details</Typography>
                    <Typography>Payment Method: {viewOrder.payment_method}</Typography>
                    <Typography>Status: {viewOrder.status}</Typography>
                    <Typography>Buy Price (per unit): ₹{formatNumber(viewOrder.buy_price)}</Typography>
                    <Typography>Sell Price (per unit): ₹{formatNumber(viewOrder.sell_price)}</Typography>
                    <Typography>Quantity: {viewOrder.quantity || 0}</Typography>
                    <Typography>Total Cost: ₹{formatNumber(viewOrder.total_cost)}</Typography>
                    <Typography>Total Price: ₹{formatNumber(viewOrder.total_price)}</Typography>
                    <Typography>Profit: ₹{formatNumber(viewOrder.profit)}</Typography>
                    <Typography>Date: {new Date(viewOrder.created_at).toLocaleString()}</Typography>

                    {viewOrder.prescription_url && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>Prescription</Typography>
                        <Button
                          variant="outlined"
                          href={getPrescriptionUrl(viewOrder)}
                          target="_blank"
                        >
                          View Prescription
                        </Button>
                      </Box>
                    )}

                    {viewOrder.admin_note && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Admin Note</Typography>
                        <Typography>{viewOrder.admin_note}</Typography>
                      </>
                    )}
                  </>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Patient Name"
                        value={editForm.patient_name}
                        onChange={(e) => setEditForm({...editForm, patient_name: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Age"
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Gender"
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        value={editForm.delivery_address}
                        onChange={(e) => setEditForm({...editForm, delivery_address: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={editForm.payment_method}
                          onChange={(e) => setEditForm({...editForm, payment_method: e.target.value})}
                          label="Payment Method"
                        >
                          <MenuItem value="cash">Cash on Delivery</MenuItem>
                          <MenuItem value="upi">UPI</MenuItem>
                          <MenuItem value="card">Card</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Total Price"
                        type="number"
                        value={editForm.total_price}
                        onChange={(e) => setEditForm({...editForm, total_price: e.target.value})}
                        InputProps={{
                          startAdornment: <span>₹</span>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          label="Status"
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Buy Price (per unit)"
                        value={editForm.buy_price || ''}
                        onChange={(e) => {
                          const buy_price = e.target.value;
                          const quantity = editForm.quantity || 0;
                          const total_cost = buy_price * quantity;
                          const total_price = (editForm.sell_price || 0) * quantity;
                          const profit = total_price - total_cost;
                          setEditForm({
                            ...editForm,
                            buy_price,
                            total_cost,
                            profit
                          });
                        }}
                        InputProps={{
                          startAdornment: <span>₹</span>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Sell Price (per unit)"
                        value={editForm.sell_price || ''}
                        onChange={(e) => {
                          const sell_price = e.target.value;
                          const quantity = editForm.quantity || 0;
                          const total_price = sell_price * quantity;
                          const total_cost = (editForm.buy_price || 0) * quantity;
                          const profit = total_price - total_cost;
                          setEditForm({
                            ...editForm,
                            sell_price,
                            total_price,
                            profit
                          });
                        }}
                        InputProps={{
                          startAdornment: <span>₹</span>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={editForm.quantity || ''}
                        onChange={(e) => {
                          const quantity = e.target.value;
                          const total_cost = (editForm.buy_price || 0) * quantity;
                          const total_price = (editForm.sell_price || 0) * quantity;
                          const profit = total_price - total_cost;
                          setEditForm({
                            ...editForm,
                            quantity,
                            total_cost,
                            total_price,
                            profit
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Order Summary</Typography>
                        <Typography>Total Cost: ₹{formatNumber(editForm.total_cost)}</Typography>
                        <Typography>Total Price: ₹{formatNumber(editForm.total_price)}</Typography>
                        <Typography>Profit: ₹{formatNumber(editForm.profit)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setViewOrder(null);
              setEditMode(false);
            }}>Cancel</Button>
            {editMode && (
              <Button onClick={handleEditSubmit} color="primary" variant="contained">
                Save Changes
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ManageOrders; 