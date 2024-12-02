import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  ButtonGroup,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBrokerProperties, updatePropertyStatus, deleteProperty } from '../utils/api';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const StatusButton = ({ children, selected, onClick }) => (
  <Button
    onClick={onClick}
    sx={{
      color: '#000',
      backgroundColor: selected ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '12px',
      px: 3,
      py: 1,
      minWidth: '120px',
      boxShadow: selected ? '0 4px 6px rgba(0, 0, 0, 0.2)' : 'none',
      border: selected ? '1px solid rgba(65, 105, 225, 0.5)' : 'none',
      '&:hover': {
        backgroundColor: selected ? 'rgba(65, 105, 225, 0.3)' : 'rgba(255, 255, 255, 0.9)',
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }}
  >
    {children}
  </Button>
);

const PropertyCard = ({ property, onStatusChange, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation(); // Prevent card click
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusMenuClick = (event) => {
    setStatusMenuAnchor(event.currentTarget);
    event.stopPropagation(); // Prevent card click
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updatePropertyStatus(property._id, newStatus);
      onStatusChange();
      handleStatusMenuClose();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProperty(property._id);
      onDelete();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: 3,
          borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }
        }}
      >
        <IconButton
          onClick={handleMenuClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& .MuiMenuItem-root': {
                fontSize: '0.95rem',
                py: 1.5,
                px: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }
              }
            }
          }}
        >
          <MenuItem onClick={handleStatusMenuClick}>Change Status</MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            Delete Listing
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={handleStatusMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              ml: -1,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& .MuiMenuItem-root': {
                fontSize: '0.95rem',
                py: 1.5,
                px: 3,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(65, 105, 225, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(65, 105, 225, 0.2)',
                  }
                }
              }
            }
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          <MenuItem 
            onClick={() => handleStatusChange('available')}
            selected={property.status === 'available'}
          >
            Available
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusChange('in_contract')}
            selected={property.status === 'in_contract'}
          >
            In Contract
          </MenuItem>
          <MenuItem 
            onClick={() => handleStatusChange('rented')}
            selected={property.status === 'rented'}
          >
            Rented
          </MenuItem>
        </Menu>

        <Typography variant="h6">
          {property.building.address.street} - Unit {property.unitNumber}
        </Typography>
        <Typography>
          {property.building.address.neighborhood}, {property.building.address.borough}
        </Typography>
        <Typography>
          {property.bedrooms} BR | ${property.price}/month
        </Typography>
        <Typography 
          sx={{ 
            color: property.status === 'available' ? 'success.main' : 
                   property.status === 'in_contract' ? 'warning.main' : 'error.main',
            fontWeight: 'bold'
          }}
        >
          Status: {property.status.replace('_', ' ').toUpperCase()}
        </Typography>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(['available']);

  const fetchProperties = async () => {
    try {
      const response = await getBrokerProperties();
      setProperties(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load properties');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== status);
      }
      return [...prev, status];
    });
  };

  const filteredProperties = properties.filter(property => 
    selectedStatuses.includes(property.status)
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design4.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 4
      }}
    >
      <Container>
        <Paper
          sx={{
            p: 4,
            mt: 12,
            borderRadius: '25px',
            background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.9), rgba(236, 229, 221, 0.8))',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ color: '#00008B' }}>
                Your Properties
              </Typography>
              <StatusButton
                onClick={() => navigate('/property-listing')}
              >
                Add New Property
              </StatusButton>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <StatusButton
                selected={selectedStatuses.includes('available')}
                onClick={() => handleStatusToggle('available')}
              >
                Available
              </StatusButton>
              <StatusButton
                selected={selectedStatuses.includes('in_contract')}
                onClick={() => handleStatusToggle('in_contract')}
              >
                In Contract
              </StatusButton>
              <StatusButton
                selected={selectedStatuses.includes('rented')}
                onClick={() => handleStatusToggle('rented')}
              >
                Rented
              </StatusButton>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {filteredProperties.map((property) => (
              <Grid item key={property._id} xs={12} md={6}>
                <PropertyCard 
                  property={property}
                  onStatusChange={fetchProperties}
                  onDelete={fetchProperties}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard; 