import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, CircularProgress, Collapse, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../utils/api';
import { ArrowForwardIos } from '@mui/icons-material';

const BoroughButton = ({ borough, selected, onClick }) => (
  <Button
    variant="text"
    onClick={onClick}
    sx={{
      px: 4,
      py: 1.5,
      fontSize: '1.3rem',
      fontWeight: 500,
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderRadius: '20px',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: '2px',
        backgroundColor: 'white',
        transform: selected ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease-in-out',
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        '&::after': {
          transform: 'scaleX(1)',
        }
      }
    }}
  >
    {borough}
  </Button>
);

const NeighborhoodButton = ({ neighborhood, selected, onClick }) => (
  <Button
    variant="text"
    onClick={onClick}
    sx={{
      py: 1,
      px: 4,
      minWidth: '250px',
      fontSize: '1.1rem',
      color: selected ? 'white' : 'rgba(255, 255, 255, 0.8)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderRadius: '20px',
      position: 'relative',
      justifyContent: 'flex-start',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: '1px',
        backgroundColor: 'white',
        transform: selected ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease-in-out',
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        '&::after': {
          transform: 'scaleX(1)',
        }
      }
    }}
  >
    {neighborhood}
  </Button>
);

const LocationSelector = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedBoroughs, setSelectedBoroughs] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getLocations();
        setLocations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error.response || error);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleBoroughClick = (borough) => {
    setSelectedBoroughs(prev => {
      if (prev.includes(borough)) {
        return prev.filter(b => b !== borough);
      }
      return [...prev, borough];
    });
  };

  const handleNeighborhoodClick = (neighborhood) => {
    setSelectedNeighborhoods(prev => {
      if (prev.includes(neighborhood)) {
        return prev.filter(n => n !== neighborhood);
      }
      return [...prev, neighborhood];
    });
  };

  const handleNext = () => {
    navigate('/search-filters', {
      state: {
        neighborhoods: selectedNeighborhoods,
        boroughs: selectedBoroughs
      }
    });
  };

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
        height: '100vh',
        width: '100%',
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design1.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflowY: 'auto'
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          pt: selectedBoroughs.length > 0 ? '20vh' : '40vh',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* Boroughs Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            flexWrap: 'wrap',
            mb: 4,
            width: '100%'
          }}
        >
          {locations.map((location) => (
            <Box
              key={location.borough}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <BoroughButton
                borough={location.borough}
                selected={selectedBoroughs.includes(location.borough)}
                onClick={() => handleBoroughClick(location.borough)}
              />
              
              <Collapse
                in={selectedBoroughs.includes(location.borough)}
                timeout={300}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  width: 'auto',
                  zIndex: 1
                }}
              >
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '4px',
                    py: 1,
                    minWidth: '250px'
                  }}
                >
                  {location.neighborhoods.map((neighborhood) => (
                    <NeighborhoodButton
                      key={neighborhood}
                      neighborhood={neighborhood}
                      selected={selectedNeighborhoods.includes(neighborhood)}
                      onClick={() => handleNeighborhoodClick(neighborhood)}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>

        {/* Move the animated instruction text here */}
        <Typography 
          variant="h6" 
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 4,
            fontSize: '1rem',
            animation: 'fadeUpDown 3.5s forwards',
            opacity: 0,
            transform: 'translateY(20px)',
            '@keyframes fadeUpDown': {
              '0%': { 
                opacity: 0,
                transform: 'translateY(20px)'
              },
              '30%': { 
                opacity: 1,
                transform: 'translateY(0)'
              },
              '70%': { 
                opacity: 1,
                transform: 'translateY(0)'
              },
              '100%': { 
                opacity: 0,
                transform: 'translateY(-20px)'
              }
            }
          }}
        >
          Click on boroughs and select neighborhoods
        </Typography>
      </Container>

      {/* Updated Search Button */}
      <Box sx={{ 
        position: 'fixed',
        bottom: '50%', // Center vertically
        right: '16px', // Keep it on the right side
        transform: 'translateY(50%)' // Adjust for exact centering
      }}>
        <IconButton 
          onClick={handleNext}
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '16px',
            borderRadius: '50%', // Default circular shape
            transform: 'scale(1.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.3) translateX(8px)', // Move right by 8px
              backgroundColor: 'transparent',
              borderRadius: '8px', // Change to rectangular shape on hover
              width: '60px', // Set specific width for rectangle
              height: '60px' // Set specific height for rectangle
            }
          }}
        >
          <ArrowForwardIos sx={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default LocationSelector; 