import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Tooltip, IconButton, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';

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

  const getMenuItems = () => {
    if (user?.role === 'broker') {
      return [
        {
          label: 'Profile',
          icon: <AccountCircleIcon />,
          onClick: () => navigate('/profile')
        },
        {
          label: 'Dashboard',
          icon: <DashboardIcon />,
          onClick: () => navigate('/dashboard')
        }
      ];
    } else {
      return [
        {
          label: 'Profile',
          icon: <AccountCircleIcon />,
          onClick: () => navigate('/profile')
        },
        {
          label: 'My Applications',
          icon: <AssignmentIcon />,
          onClick: () => navigate('/my-applications')
        },
        {
          label: 'Saved Listings',
          icon: <BookmarkIcon />,
          onClick: () => navigate('/saved-listings')
        }
      ];
    }
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
              boxShadow: '0 2px 12px rgba(75, 0, 130, 0.15)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(75, 0, 130, 0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(75, 0, 130, 0.15)';
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
                    width: '60px',
                    height: '40px',
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
                    width: '200px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '& .MuiMenuItem-root': {
                      fontSize: '0.9rem',
                      py: 1.2,
                      px: 2,
                      gap: 1.5,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateX(4px)',
                        '& .MuiSvgIcon-root': {
                          color: '#4169E1'
                        },
                        '& .MuiTypography-root': {
                          color: '#4169E1'
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.1rem',
                        color: '#666'
                      },
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: '#333'
                      }
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {getMenuItems().map((item) => (
                  <MenuItem 
                    key={item.label} 
                    onClick={() => {
                      item.onClick();
                      handleClose();
                    }}
                  >
                    {item.icon}
                    <Typography>{item.label}</Typography>
                  </MenuItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    '&:hover': {
                      '& .MuiSvgIcon-root': {
                        color: '#f44336 !important'
                      },
                      '& .MuiTypography-root': {
                        color: '#f44336 !important'
                      }
                    }
                  }}
                >
                  <LogoutIcon />
                  <Typography>Logout</Typography>
                </MenuItem>
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