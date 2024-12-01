import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBrokerProperties } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
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
          <Typography variant="h4" gutterBottom sx={{ color: '#00008B' }}>
            Welcome, {user?.name}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/property-listing')}
            sx={{
              mt: 2,
              mb: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#000',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Add New Property
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="h5" sx={{ mb: 3, color: '#00008B' }}>
            Your Properties
          </Typography>

          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} md={6} key={property._id}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '15px',
                    background: 'rgba(255, 255, 255, 0.8)',
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
                  <Typography color={property.status === 'available' ? 'success.main' : 'error.main'}>
                    Status: {property.status}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/properties/${property._id}`)}
                    sx={{ mt: 2 }}
                  >
                    View Details
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard; 