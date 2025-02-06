import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  LocalHospital as MedicineIcon,
  Business as CompanyIcon,
  Group as EmployeeIcon,
  TrendingUp as ProfitIcon,
  AttachMoney as SalesIcon,
  Warning as ExpireIcon,
  Pending as PendingIcon,
  RequestPage as RequestIcon,
  LocalHospital as LogoIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  PeopleAlt as PeopleAltIcon,
  AccountBalance as AccountBalanceIcon,
  Support as SupportIcon,
  MedicationOutlined,
  BusinessOutlined,
  GroupOutlined,
  RequestPageOutlined,
  MonetizationOnOutlined,
  CheckCircleOutlined,
  PendingOutlined,
  TrendingUpOutlined,
  CalendarTodayOutlined,
  Warning as WarningOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import AIChat from '../components/AIChat';

const DashboardCard = ({ title, value, icon, color }) => (
  <Card sx={{ 
    height: '100%',
    backgroundColor: color || '#fff',
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  }}>
    <CardContent sx={{ p: 2.5 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: 1,
          backgroundColor: 'rgba(255,255,255,0.2)'
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 32 } })}
        </Grid>
        <Grid item xs>
          <Typography 
            variant="subtitle2" 
            component="div" 
            sx={{ 
              color: 'text.secondary',
              mb: 0.5,
              fontWeight: 500 
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h5" 
            component="div"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const username = localStorage.getItem('username');
  const [dashboardData, setDashboardData] = React.useState({
    total_medicines: 0,
    total_companies: 0,
    total_employees: 0,
    total_requests: 0,
    total_sales: 0,
    total_profit: 0,
    expiring_medicines: 0,
    completed_requests: 0,
    pending_requests: 0,
    today_amount: 0,
    today_profit: 0,
    monthly_data: []
  });

  // Add ref for the main container
  const mainRef = useRef(null);

  useEffect(() => {
    // Verify token on component mount
    const verifyAuth = async () => {
      try {
        await axiosInstance.get('/api/verify-token/');  // You'll need to create this endpoint
        setLoading(false);
      } catch (error) {
        console.error('Authentication failed:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    verifyAuth();
  }, [navigate]);

  useEffect(() => {
    // Disable browser back button
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location.replace('/login'); // Use window.location.replace instead of navigate
    }
  };

  // Add effect to prevent back navigation when not authenticated
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!localStorage.getItem('accessToken')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/api/home_api/');
        console.log('Dashboard Response:', response.data);

        if (!response.data.error) {
          const formattedData = {
            total_medicines: response.data.medicine_count || 0,
            total_companies: response.data.company_count || 0,
            total_employees: response.data.employee_count || 0,
            total_requests: response.data.customer_request || 0,
            total_sales: parseFloat(response.data.sell_total) || 0,
            total_profit: parseFloat(response.data.profit_total) || 0,
            expiring_medicines: response.data.medicine_expire_serializer_data || 0,
            completed_requests: response.data.request_completed || 0,
            pending_requests: response.data.request_pending || 0,
            today_amount: parseFloat(response.data.sell_amt_today) || 0,
            today_profit: parseFloat(response.data.profit_amt_today) || 0,
            monthly_data: (response.data.sell_chart || []).map(item => ({
              name: item.date,
              sales: parseFloat(item.amt) || 0,
              profit: parseFloat(response.data.profit_chart.find(p => p.date === item.date)?.amt || 0)
            }))
          };
          
          console.log('Formatted Data:', formattedData);
          setDashboardData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: '#1976d2'
    },
    { 
      text: 'Company', 
      icon: <CompanyIcon />,
      path: '/company',
      color: '#2e7d32'
    },
    { 
      text: 'Add Medicine', 
      icon: <AddCircleOutlineIcon />,
      path: '/add-medicine',
      color: '#ed6c02'
    },
    { 
      text: 'Manage Medicine', 
      icon: <MedicineIcon />,
      path: '/manage-medicine',
      color: '#9c27b0'
    },
    { 
      text: 'Manage Company Account', 
      icon: <AccountBalanceIcon />,
      path: '/company-account',
      color: '#0288d1'
    },
    { 
      text: 'Manage Employee', 
      icon: <PeopleAltIcon />,
      path: '/manage-employee',
      color: '#d32f2f'
    },
    { 
      text: 'Customer Request', 
      icon: <SupportIcon />,
      path: '/customer-request',
      color: '#7b1fa2'
    },
  ];

  const dashboardItems = [
    {
      title: 'Total Medicines',
      value: dashboardData.total_medicines || 0,
      icon: <MedicationOutlined sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#e3f2fd'
    },
    {
      title: 'Total Companies',
      value: dashboardData.total_companies || 0,
      icon: <BusinessOutlined sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#e8f5e9'
    },
    {
      title: 'Total Employees',
      value: dashboardData.total_employees || 0,
      icon: <GroupOutlined sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#fff3e0'
    },
    {
      title: 'Total Requests',
      value: dashboardData.total_requests || 0,
      icon: <RequestPageOutlined sx={{ fontSize: 40, color: '#9c27b0' }} />,
      color: '#f3e5f5'
    },
    {
      title: 'Total Sales',
      value: `₹${parseFloat(dashboardData.total_sales || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <MonetizationOnOutlined sx={{ fontSize: 40, color: '#0288d1' }} />,
      color: '#e1f5fe'
    },
    {
      title: 'Total Profit',
      value: `₹${parseFloat(dashboardData.total_profit || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <TrendingUpOutlined sx={{ fontSize: 40, color: '#388e3c' }} />,
      color: '#e8f5e9'
    },
    {
      title: 'Expiring Medicines',
      value: dashboardData.expiring_medicines || 0,
      icon: <ExpireIcon />,
      color: 'rgba(211, 47, 47, 0.1)',
      iconColor: '#d32f2f'
    },
    {
      title: 'Completed Requests',
      value: dashboardData.completed_requests || 0,
      icon: <CheckCircleOutlined sx={{ fontSize: 40, color: '#388e3c' }} />,
      color: '#e8f5e9'
    },
    {
      title: 'Pending Requests',
      value: dashboardData.pending_requests || 0,
      icon: <PendingIcon />,
      color: 'rgba(237, 108, 2, 0.1)',
      iconColor: '#ed6c02'
    },
    {
      title: "Today's Sales",
      value: `₹${parseFloat(dashboardData.today_amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <CalendarTodayOutlined sx={{ fontSize: 40, color: '#0288d1' }} />,
      color: '#e1f5fe'
    },
    {
      title: "Today's Profit",
      value: `₹${parseFloat(dashboardData.today_profit || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <MonetizationOnOutlined sx={{ fontSize: 40, color: '#388e3c' }} />,
      color: '#e8f5e9'
    },
    {
      title: 'Sales Amount',
      value: `₹${parseFloat(dashboardData.total_sales || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <MonetizationOnOutlined sx={{ fontSize: 40, color: '#0288d1' }} />,
      color: '#e1f5fe'
    }
  ];

  // Update the debug useEffect
  useEffect(() => {
    // Wait for a moment to ensure elements are mounted
    setTimeout(() => {
      if (mainRef.current) {
        const mainElement = mainRef.current;
        const containerElement = mainElement.querySelector('.MuiContainer-root');
        const gridElement = containerElement?.querySelector('.MuiGrid-root');

        console.log('Layout Dimensions:', {
          window: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          main: mainElement ? {
            width: mainElement.offsetWidth,
            left: mainElement.offsetLeft,
            padding: window.getComputedStyle(mainElement).padding
          } : null,
          container: containerElement ? {
            width: containerElement.offsetWidth,
            padding: window.getComputedStyle(containerElement).padding
          } : null,
          grid: gridElement ? {
            width: gridElement.offsetWidth,
            margin: window.getComputedStyle(gridElement).margin
          } : null
        });
      }
    }, 100); // Small delay to ensure rendering
  }, []);

  useEffect(() => {
    const logDimensions = () => {
      if (mainRef.current) {
        console.log('Detailed Layout Info:', {
          window: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          main: {
            width: mainRef.current.offsetWidth,
            left: mainRef.current.offsetLeft,
            computedStyle: window.getComputedStyle(mainRef.current)
          },
          sidebar: document.querySelector('.MuiDrawer-paper')?.offsetWidth || 0
        });
      }
    };

    // Log on mount and window resize
    logDimensions();
    window.addEventListener('resize', logDimensions);
    return () => window.removeEventListener('resize', logDimensions);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box ref={mainRef} sx={{ flexGrow: 1 }}>
      <Box sx={{ 
        flexGrow: 1,
        p: 3,
        backgroundColor: '#f5f5f5',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <Container 
          maxWidth={false}
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            p: { xs: 1, sm: 2 },
          }}
        >
          <Grid 
            container 
            spacing={2}
            sx={{ 
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 2,
              gridAutoRows: 'minmax(120px, auto)'
            }}
          >
            {dashboardItems.map((item, index) => (
              <Grid item key={index}>
                <DashboardCard {...item} />
              </Grid>
            ))}
          </Grid>

          {/* Chart section */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              mt: 4,
              mb: 4
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              Sales and Profit Overview
            </Typography>
            <Box sx={{ 
              height: 400,
              width: '100%',
              minHeight: 400,
              position: 'relative'
            }}>
              {dashboardData.monthly_data?.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart
                    data={dashboardData.monthly_data}
                    margin={{ top: 25, right: 30, left: 25, bottom: 25 }}
                  >
                    {dashboardData.monthly_data.length === 0 && (
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        fill="#666"
                      >
                        No data available
                      </text>
                    )}
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="name" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#1976d2" 
                      name="Sales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#2e7d32" 
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography>No chart data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
      <AIChat />
    </Box>
  );
};

export default Dashboard; 