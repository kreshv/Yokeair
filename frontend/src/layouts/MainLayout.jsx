import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          backgroundColor: '#e0e0e0',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 