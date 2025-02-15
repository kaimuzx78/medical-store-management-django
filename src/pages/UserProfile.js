import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    username: '',
    email: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const token = localStorage.getItem('accessToken');
      console.log('Token:', token); // Debug log
      
      const response = await axiosInstance.get('/api/user/profile/');
      console.log('Profile response:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      
      setProfile(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Optionally redirect to login
        // navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.put('/api/user/profile/', {
        username: profile.username,
        email: profile.email,
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      setSuccess('Profile updated successfully');
      localStorage.setItem('username', profile.username);
      setError('');
    } catch (error) {
      console.error('Update Error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setSuccess('');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await axiosInstance.put('/api/user/change-password/', {
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });

      // Update tokens if password change was successful
      if (response.data.data?.access) {
        localStorage.setItem('accessToken', response.data.data.access);
        localStorage.setItem('refreshToken', response.data.data.refresh);
      }

      setSuccess('Password updated successfully');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Profile Information</Typography>
            </Box>
            
            <form onSubmit={handleProfileUpdate}>
              <TextField
                fullWidth
                label="Username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                fullWidth
              >
                Update Profile
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Change Password</Typography>
            </Box>
            
            <form onSubmit={handlePasswordChange}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                fullWidth
              >
                Change Password
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {(error || success) && (
        <Box sx={{ mt: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Box>
      )}
    </Box>
  );
};

export default UserProfile; 