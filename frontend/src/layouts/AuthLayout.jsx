import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar 
        position="absolute" 
        sx={{ 
          backgroundColor: 'transparent', 
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <RouterLink to="/">
            <img 
              src="/logo.png" 
              alt="Yoke Logo" 
              style={{ 
                height: '45px',
                objectFit: 'contain',
                borderRadius: '15px',
                boxShadow: '0 2px 12px rgba(75, 0, 130, 0.15)'
              }} 
            />
          </RouterLink>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  );
};

export default AuthLayout; 