import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid, Button, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchProperties, saveListing } from '../utils/api';
import ApartmentCard from '../components/ApartmentCard';
import '@fontsource/raleway'; // Import Raleway font

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        console.log('Fetching apartments...');
        const response = await searchProperties({ status: 'available' });
        console.log('Search response:', response);
        
        // Handle both array response and object with data property
        const apartmentsData = Array.isArray(response) ? response : response?.data || [];
        console.log('Setting apartments:', apartmentsData);
        setApartments(apartmentsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load apartments:', err);
        setError('Failed to load apartments');
        setLoading(false);
      }
    };

    fetchApartments();
  }, [user]);

  const handleRefineSearch = () => {
    navigate('/location-selector');
  };

  const handleSaveClick = async (apartmentId) => {
    if (!user) {
      // Store the apartment ID they tried to save
      localStorage.setItem('pendingSave', apartmentId);
      // Store the current path to return to
      localStorage.setItem('returnPath', location.pathname);
      // Redirect to register
      navigate('/register');
      return;
    }

    try {
      await saveListing(apartmentId);
      // Update the UI to show the apartment as saved
      setApartments(prevApartments => 
        prevApartments.map(apt => 
          apt._id === apartmentId ? { ...apt, isSaved: true } : apt
        )
      );
    } catch (err) {
      console.error('Failed to save listing:', err);
      setError('Failed to save listing. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
        width: '100%',
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design3.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: 4,
        mt: 0
      }}
    >
      <Container sx={{ mt: 10 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleRefineSearch}
              sx={{
                px: 2.5,
                py: 1.2,
                fontSize: '0.9rem',
                fontWeight: 400,
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: '15px',
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
              Refine Listings
            </Button>
          </Grid>
          <Grid item xs={12}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Grid container spacing={3}>
              {apartments.map((apartment) => (
                <Grid item key={apartment._id} xs={12} sm={6} md={4}>
                  <ApartmentCard 
                    apartment={apartment}
                    showSaveButton={true}
                    onSaveClick={() => handleSaveClick(apartment._id)}
                  />
                </Grid>
              ))}
              {apartments.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '50vh',
                    width: '100%'
                  }}>
                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                      No properties available at the moment.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 