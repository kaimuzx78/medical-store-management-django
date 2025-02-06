import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EditMedicineDialog = ({ open, medicine, companies, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    medical_type: '',
    buy_price: '',
    sell_price: '',
    c_gst: '',
    s_gst: '',
    batch_no: '',
    shelf_no: '',
    expire_date: null,
    mfg_date: null,
    description: '',
    in_stock_total: '',
    qty_in_strip: '',
    company_id: '',
    salt_name: '',
    salt_qty: '',
    salt_qty_type: '',
  });

  React.useEffect(() => {
    if (medicine) {
      setFormData({
        ...medicine,
        expire_date: medicine.expire_date ? new Date(medicine.expire_date) : null,
        mfg_date: medicine.mfg_date ? new Date(medicine.mfg_date) : null,
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      expire_date: formData.expire_date?.toISOString().split('T')[0],
      mfg_date: formData.mfg_date?.toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Medicine</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Medicine Type"
              name="medical_type"
              value={formData.medical_type}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buy Price"
              name="buy_price"
              type="number"
              value={formData.buy_price}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Sell Price"
              name="sell_price"
              type="number"
              value={formData.sell_price}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="C-GST"
              name="c_gst"
              type="number"
              value={formData.c_gst}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="S-GST"
              name="s_gst"
              type="number"
              value={formData.s_gst}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Batch No."
              name="batch_no"
              value={formData.batch_no}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Shelf No."
              name="shelf_no"
              value={formData.shelf_no}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expire Date"
                value={formData.expire_date}
                onChange={handleDateChange('expire_date')}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Mfg Date"
                value={formData.mfg_date}
                onChange={handleDateChange('mfg_date')}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="In Stock Total"
              name="in_stock_total"
              type="number"
              value={formData.in_stock_total}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Qty. in Strip"
              name="qty_in_strip"
              type="number"
              value={formData.qty_in_strip}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Company</InputLabel>
              <Select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                label="Company"
              >
                {Array.isArray(companies) && companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Salt Name"
              name="salt_name"
              value={formData.salt_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Salt Qty"
              name="salt_qty"
              value={formData.salt_qty}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Salt Qty Type"
              name="salt_qty_type"
              value={formData.salt_qty_type}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMedicineDialog; 