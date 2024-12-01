import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Tooltip } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'transparent', 
        boxShadow: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          {user ? (
            <>
              <Tooltip title="Menu" arrow>
                <Button
                  onClick={handleMenu}
                  sx={{
                    color: '#000',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    width: '100px',
                    height: '40px',
                    minWidth: '100px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <MenuIcon />
                </Button>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '& .MuiMenuItem-root': {
                      fontSize: '0.95rem',
                      py: 1,
                      px: 2
                    }
                  }
                }}
              >
                <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  color: '#4169E1',
                  borderColor: '#4169E1',
                  borderRadius: '12px',
                  px: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#4B0082',
                    color: '#4B0082',
                    backgroundColor: '#FFB6C1',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                sx={{
                  backgroundColor: '#4169E1',
                  color: '#fff',
                  borderRadius: '12px',
                  px: 3,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#4B0082',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 