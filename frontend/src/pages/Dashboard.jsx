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
  IconButton,
  Checkbox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBrokerProperties, updatePropertyStatus, deleteProperty, bulkDeleteProperties } from '../utils/api';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const StatusButton = ({ children, selected, onClick, sx }) => (
  <Button
    onClick={onClick}
    sx={{
      color: '#000',
      backgroundColor: selected ? 'rgba(128, 0, 128, 0.3)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '20px',
      px: 1.5,
      py: 0.5,
      minWidth: '80px',
      fontSize: '0.85rem',
      boxShadow: selected ? '0 4px 6px rgba(0, 0, 0, 0.2)' : 'none',
      border: selected ? '2px solid #00008B' : 'none',
      '&:hover': {
        backgroundColor: selected ? 'rgba(128, 0, 128, 0.4)' : 'rgba(255, 255, 255, 0.9)',
        transform: 'translateY(-4px)',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      ...sx
    }}
  >
    {children}
  </Button>
);

// Create a styled Paper component for PropertyCard
const StyledPropertyCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '15px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        '& .property-checkbox': {
            opacity: 1,
        },
    },
    '& .property-checkbox': {
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
    },
}));

// Utility function to format status
const formatStatus = (status) => {
    return status
        .replace('_', ' ') // Replace underscores with spaces
        .toLowerCase() // Convert to lowercase
        .split(' ') // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(' '); // Join back into a string
};

const PropertyCard = ({ property, onStatusChange, onDelete, selected, onSelect }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      await deleteProperty(property._id);
      onDelete();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting property:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete property. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <StyledPropertyCard>
        <Box sx={{ 
          position: 'absolute', 
          top: 4, 
          left: 4, 
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Checkbox
            className="property-checkbox"
            checked={selected}
            onChange={onSelect}
            icon={<CheckBoxOutlineBlankIcon sx={{ 
              borderRadius: '50%', 
              color: 'grey.400',
              fontSize: 20 
            }} />}
            checkedIcon={<CheckBoxIcon sx={{ 
              borderRadius: '50%', 
              color: 'grey.400',
              fontSize: 20 
            }} />}
            sx={{ 
              color: 'grey.400',
              '&.Mui-checked': {
                color: 'grey.400',
                opacity: 1,
              },
              '& .MuiSvgIcon-root': {
                borderRadius: '50%',
                fontSize: 20,
              },
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          />
        </Box>

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
              width: '150px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '15px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& .MuiMenuItem-root': {
                fontSize: '0.85rem',
                py: 1,
                px: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }
              }
            }
          }}
        >
          <MenuItem onClick={() => navigate(`/property-listing/${property._id}`)}>Edit</MenuItem>
          <MenuItem onClick={handleStatusMenuClick}>Change Status</MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            Delete
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
                py: 0.5,
                px: 2,
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
          sx={{ width: '200px' }}
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
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: property.status === 'available' ? 'success.main' : 
                   property.status === 'in_contract' ? 'warning.main' : 'error.main',
            fontWeight: 'bold'
          }}
        >
          {formatStatus(property.status)}
        </Typography>
      </StyledPropertyCard>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '15px',
            p: 1
          }
        }}
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Create a styled Paper component for consistent styling
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(12),
    borderRadius: '25px',
    background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.9), rgba(236, 229, 221, 0.8))',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(255, 255, 255, 0.3)',
    },
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState(['available']);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteProgress, setDeleteProgress] = useState(null);

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

  const handleSelectProperty = (propertyId) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
        const result = await bulkDeleteProperties(selectedProperties, (current, total) => {
            setDeleteProgress(`Deleting ${current} of ${total} properties...`);
        });
        
        if (result.success) {
            await fetchProperties(); // Refresh the properties list
            setSelectedProperties([]); // Clear selection
            setBulkDeleteDialogOpen(false);
        } else {
            setDeleteError(`Successfully deleted ${result.deletedCount} properties, but encountered ${result.errors.length} errors.`);
        }
    } catch (error) {
        console.error('Bulk delete error:', error);
        setDeleteError('Failed to delete properties. Please try again.');
    } finally {
        setIsDeleting(false);
        setDeleteProgress(null);
    }
  };

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
        <StyledPaper>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ color: '#00008B' }}>
                Your Properties
              </Typography>
              <StatusButton
                onClick={() => navigate('/property-listing')}
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: '#000',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-4px)',
                    color: '#00008B',
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                Add New Property
              </StatusButton>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <StatusButton
                selected={selectedStatuses.includes('available')}
                onClick={() => handleStatusToggle('available')}
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: '#000',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-4px)',
                    color: '#00008B',
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                Available
              </StatusButton>
              <StatusButton
                selected={selectedStatuses.includes('in_contract')}
                onClick={() => handleStatusToggle('in_contract')}
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: '#000',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-4px)',
                    color: '#00008B',
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                In Contract
              </StatusButton>
              <StatusButton
                selected={selectedStatuses.includes('rented')}
                onClick={() => handleStatusToggle('rented')}
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: '#000',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-4px)',
                    color: '#00008B',
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                  }
                }}
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
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <PropertyCard
                  property={property}
                  onStatusChange={fetchProperties}
                  onDelete={fetchProperties}
                  selected={selectedProperties.includes(property._id)}
                  onSelect={() => handleSelectProperty(property._id)}
                />
              </Grid>
            ))}
          </Grid>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 3,
              position: 'sticky',
              bottom: 16,
              zIndex: 2
            }}
          >
            {selectedProperties.length > 0 && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setBulkDeleteDialogOpen(true)}
                startIcon={<DeleteIcon />}
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 3,
                  boxShadow: 3
                }}
              >
                Delete Selected ({selectedProperties.length})
              </Button>
            )}
            {properties.length > 0 && (
              <Button
                variant="outlined"
                onClick={handleSelectAll}
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 3,
                  ml: 'auto',
                  backgroundColor: 'white',
                  boxShadow: 1
                }}
              >
                {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </Box>

          <Dialog
            open={bulkDeleteDialogOpen}
            onClose={() => !isDeleting && setBulkDeleteDialogOpen(false)}
            PaperProps={{
                sx: {
                    borderRadius: '15px',
                    p: 1
                }
            }}
          >
            <DialogContent>
                {!isDeleting ? (
                    <>
                        <DialogContentText>
                            Are you sure you want to delete {selectedProperties.length} listing{selectedProperties.length !== 1 ? 's' : ''}? This action cannot be undone.
                        </DialogContentText>
                        {deleteError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {deleteError}
                            </Alert>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <DialogContentText>
                            {deleteProgress || 'Deleting properties...'}
                        </DialogContentText>
                    </Box>
                )}
            </DialogContent>
            {!isDeleting && (
                <DialogActions>
                    <Button 
                        onClick={() => setBulkDeleteDialogOpen(false)} 
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBulkDelete} 
                        color="error"
                        disabled={isDeleting}
                    >
                        Delete
                    </Button>
                </DialogActions>
            )}
          </Dialog>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default Dashboard; 