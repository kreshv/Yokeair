import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';

const AuthLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      <Outlet />
    </Box>
  );
};

export default AuthLayout; 