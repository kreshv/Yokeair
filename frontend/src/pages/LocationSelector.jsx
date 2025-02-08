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
      px: '2vw',  // Responsive padding based on viewport width
      py: '0.8vh', // Responsive padding based on viewport height
      fontSize: 'clamp(0.8rem, 1.5vw, 1.3rem)', // Responsive font size that scales between 0.8rem and 1.3rem
      fontWeight: 500,
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: 'clamp(0.5px, 0.2vw, 1px)',
      borderRadius: '20px',
      position: 'relative',
      whiteSpace: 'nowrap',
      minWidth: 'unset',
      width: '100%', // Take full width of parent
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
      py: 'clamp(0.3rem, 0.6vh, 1rem)',
      px: 'clamp(0.8rem, 1.5vw, 3rem)',
      fontSize: 'clamp(0.7rem, 1.2vw, 1.1rem)',
      color: selected ? 'white' : 'rgba(255, 255, 255, 0.8)',
      textTransform: 'uppercase',
      letterSpacing: 'clamp(0.3px, 0.15vw, 0.5px)',
      borderRadius: '20px',
      position: 'relative',
      justifyContent: 'flex-start',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: '100%',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '7%',
        right: '40%',
        height: '1px',
        backgroundColor: 'white',
        transform: selected ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease-in-out',
        transformOrigin: 'left',
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
        const boroughOrder = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
        const sortedLocations = response.data.sort((a, b) => {
          return boroughOrder.indexOf(a.borough) - boroughOrder.indexOf(b.borough);
        });
        setLocations(sortedLocations);
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

  const handleContinue = () => {
    const params = new URLSearchParams();
    
    if (selectedBoroughs.length > 0) {
      params.set('boroughs', selectedBoroughs.join(','));
    }
    
    if (selectedNeighborhoods.length > 0) {
      params.set('neighborhoods', selectedNeighborhoods.join(','));
    }

    // Update URL without causing a reload
    window.history.replaceState(
      {
        selectedBoroughs,
        selectedNeighborhoods,
        scrollPosition: window.scrollY
      },
      '',
      `/search-filters?${params.toString()}`
    );
    
    // Navigate programmatically
    navigate(`/search-filters?${params.toString()}`, {
      replace: true,
      state: {
        selectedBoroughs,
        selectedNeighborhoods,
        scrollPosition: window.scrollY
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
            gap: 'clamp(0.5rem, 1vw, 2rem)', // Responsive gap that scales with viewport width
            width: '90%', // Take 90% of container width
            maxWidth: '1200px',
            mx: 'auto',
            flexWrap: 'nowrap'
          }}
        >
          {locations.map((location) => (
            <Box
              key={location.borough}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                width: `${100 / locations.length}%`, // Divide space equally based on number of boroughs
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
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: location.borough === 'Brooklyn' ? 'clamp(150px, 30vw, 320px)' : 'clamp(150px, 25vw, 300px)',
                  zIndex: 1
                }}
              >
                <Box
                  sx={{
                    mt: 'clamp(0.3rem, 0.8vh, 1rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(0.2rem, 0.4vh, 0.5rem)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 'clamp(4px, 0.5vw, 8px)',
                    py: 'clamp(0.3rem, 0.8vh, 1rem)',
                    px: 'clamp(0.3rem, 0.5vw, 1rem)',
                    maxHeight: location.borough === 'Brooklyn' ? 'none' : '60vh',
                    overflowY: location.borough === 'Brooklyn' ? 'visible' : 'auto',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    }
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
          onClick={handleContinue}
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