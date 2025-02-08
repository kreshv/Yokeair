import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Tooltip, IconButton, Divider, TextField, InputAdornment } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hideSearchBarRoutes = ['/location-selector', '/search-filters', '/profile', '/dashboard', '/property-listing', '/edit-property', '/saved-listings', '/my-applications', '/login', '/register'];
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setAnchorEl(null);
  }, [location.pathname]);

  // Add ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setSearchQuery('');
        // Blur the search input
        searchInputRef.current?.querySelector('input')?.blur();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    setTimeout(() => {
      logout();
      navigate('/');
    }, 100);
  };

  const getMenuItems = () => {
    if (user?.role === 'broker') {
      return [
        {
          label: 'Profile',
          icon: <AccountCircleIcon />,
          onClick: () => {
            setAnchorEl(null);
            setTimeout(() => navigate('/profile'), 100);
          }
        },
        {
          label: 'Dashboard',
          icon: <DashboardIcon />,
          onClick: () => {
            setAnchorEl(null);
            setTimeout(() => navigate('/dashboard'), 100);
          }
        }
      ];
    } else {
      return [
        {
          label: 'Profile',
          icon: <AccountCircleIcon />,
          onClick: () => {
            setAnchorEl(null);
            setTimeout(() => navigate('/profile'), 100);
          }
        },
        {
          label: 'My Applications',
          icon: <AssignmentIcon />,
          onClick: () => {
            setAnchorEl(null);
            setTimeout(() => navigate('/my-applications'), 100);
          }
        },
        {
          label: 'Saved Listings',
          icon: <BookmarkIcon />,
          onClick: () => {
            setAnchorEl(null);
            setTimeout(() => navigate('/saved-listings'), 100);
          }
        }
      ];
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  return (
    <>
      {/* Update overlay when search is focused */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          opacity: isSearchFocused ? 1 : 0,
          visibility: isSearchFocused ? 'visible' : 'hidden',
          transition: 'all 0.3s ease-in-out',
          zIndex: 999
        }}
        onClick={() => setIsSearchFocused(false)}
      />

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
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontFamily: 'Didot, serif', color: '#FAF8F3', cursor: 'pointer', fontSize: '1.5rem' }}>home</Typography>
          </RouterLink>

          {/* Search Field */}
          {!hideSearchBarRoutes.some(route => location.pathname.startsWith(route)) && (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              maxWidth: '600px',
              mx: 'auto',
              transition: 'all 0.3s ease-in-out',
              transform: isSearchFocused ? 'translateY(20px) scale(1.05)' : 'none',
              zIndex: 1001
            }}>
              <TextField
                ref={searchInputRef}
                placeholder="Search addresses, neighborhoods, brokerages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                variant="outlined"
                fullWidth
                autoComplete="off"
                sx={{
                  backgroundColor: isSearchFocused ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  transform: isSearchFocused ? 'translateZ(50px)' : 'none',
                  transition: 'all 0.3s ease-in-out',
                  boxShadow: isSearchFocused ? '0 8px 32px rgba(0, 0, 0, 0.2)' : 'none',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4169E1',
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4169E1',
                        borderWidth: '2px'
                      }
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ 
                        color: isSearchFocused ? '#4169E1' : 'text.secondary',
                        transition: 'all 0.3s ease-in-out'
                      }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}

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
                      onClick={item.onClick}
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
    </>
  );
};

export default Navbar; 