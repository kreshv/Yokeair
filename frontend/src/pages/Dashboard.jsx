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
  ButtonGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBrokerProperties, updatePropertyStatus } from '../utils/api';

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

const PropertyCard = ({ property, onStatusChange }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      await updatePropertyStatus(property._id, newStatus);
      onStatusChange(); // Refresh the properties list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Paper
      onClick={() => handleStatusChange(
        property.status === 'available' ? 'in_contract' :
        property.status === 'in_contract' ? 'rented' : 'available'
      )}
      sx={{
        p: 3,
        borderRadius: '15px',
        background: 'rgba(255, 255, 255, 0.8)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }
      }}
    >
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