import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  console.log('Home component rendered');

  return (
    <Box
      sx={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/hero-image.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        border: '2px solid red',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                border: '1px solid white',
              }}
            >
              Find Your Perfect Home
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Discover beautiful apartments in your desired location
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/apartments')}
              sx={{
                fontSize: '1.2rem',
                py: 1.5,
                px: 4,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Browse Apartments
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 