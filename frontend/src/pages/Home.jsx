import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchProperties } from '../utils/api'; // Import the searchProperties function
import ApartmentCard from '../components/ApartmentCard';
import '@fontsource/raleway'; // Import Raleway font

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await searchProperties({}); // Fetch all apartments
        setApartments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load apartments');
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

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
        mt: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 5,
          maxWidth: 1200,
          width: '90%',
          borderRadius: '25px',
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(255, 255, 255, 0.3)',
          },
          mt: 6,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 530,
            mb: 10,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            fontSize: '1.30rem',
            textAlign: 'center',
            fontFamily: 'Raleway, sans-serif', // Apply Raleway font
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Add text shadow for 3D effect
          }}
        >
          Apartments for Rent
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={3}>
          {apartments.map((apartment) => (
            <Grid item key={apartment._id} xs={12} sm={6} md={4}>
              <ApartmentCard apartment={apartment} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Home; 