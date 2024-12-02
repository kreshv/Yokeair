import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("/homepage.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0
      }}
    >
      <Paper 
        elevation={5}
        sx={{
          p: 5,
          maxWidth: 500,
          width: '90%',
          borderRadius: '25px',
          background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.8), rgba(236, 229, 221, 0.7))',
          backdropFilter: 'blur(15px)',
          textAlign: 'center',
          boxShadow: '0 8px 32px 0 rgba(75, 0, 130, 0.15)',
          border: '1px solid rgba(211, 211, 211, 0.3)',
          transform: 'translateY(-20px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '25px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
            pointerEvents: 'none'
          }
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 5,
            color: '#00008B',
            fontFamily: '"Inter", "Roboto", sans-serif',
            letterSpacing: '-0.5px',
            textShadow: '1px 1px 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          What's your goal for today?
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          px: 2 
        }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/location-selector')}
            sx={{
              py: 2.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: '15px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid #4169E1',
              color: '#4169E1',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#FFB6C1',
                borderColor: '#4169E1',
                color: '#4B0082',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(75, 0, 130, 0.2)'
              }
            }}
          >
            Exploring homes
          </Button>
          
          <Button
            onClick={() => navigate('/register', { state: { fromShowcasing: true } })}
            variant="contained"
            size="large"
            sx={{
              py: 2.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: '15px',
              backgroundColor: '#4169E1',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#4B0082',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(75, 0, 130, 0.2)'
              }
            }}
          >
            Showcasing my property
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home; 