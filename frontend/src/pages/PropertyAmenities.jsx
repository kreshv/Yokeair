import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAmenities, updateProperty } from '../utils/api';

const PropertyAmenities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId, userId } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState({
    building: [],
    unit: []
  });
  const [selectedAmenities, setSelectedAmenities] = useState({
    building: [],
    unit: []
  });

  useEffect(() => {
    if (!propertyId || !userId) {
      navigate('/property-listing');
      return;
    }

    const fetchAmenities = async () => {
      try {
        const response = await getAmenities();
        const buildingAmenities = response.data.filter(a => a.type === 'building');
        const unitAmenities = response.data.filter(a => a.type === 'unit');
        
        setAmenities({
          building: buildingAmenities,
          unit: unitAmenities
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load amenities');
        setLoading(false);
      }
    };

    fetchAmenities();
  }, [propertyId, userId, navigate]);

  const handleAmenityChange = (type, amenityId) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [type]: prev[type].includes(amenityId)
        ? prev[type].filter(id => id !== amenityId)
        : [...prev[type], amenityId]
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(''); // Clear any existing errors
      console.log('Updating property:', propertyId, {
        buildingAmenities: selectedAmenities.building,
        unitFeatures: selectedAmenities.unit
      });

      await updateProperty(propertyId, {
        buildingAmenities: selectedAmenities.building,
        unitFeatures: selectedAmenities.unit
      });
      
      navigate('/dashboard'); // Or wherever you want to redirect after successful submission
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update property amenities');
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
          background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflowY: 'auto'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={5}
          sx={{
            p: 5,
            mt: '10vh',
            borderRadius: '25px',
            background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.8), rgba(236, 229, 221, 0.7))',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(211, 211, 211, 0.3)'
          }}
        >
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom
            sx={{ 
              mb: 4, 
              color: '#00008B',
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Select Amenities & Features
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="h6" sx={{ mb: 2, color: '#00008B' }}>
            Building Amenities
          </Typography>
          <FormGroup sx={{ mb: 4 }}>
            {amenities.building.map((amenity) => (
              <FormControlLabel
                key={amenity._id}
                control={
                  <Checkbox
                    checked={selectedAmenities.building.includes(amenity._id)}
                    onChange={() => handleAmenityChange('building', amenity._id)}
                  />
                }
                label={amenity.name}
              />
            ))}
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2, mt: 3, color: '#00008B' }}>
            Unit Features
          </Typography>
          <FormGroup sx={{ mb: 4 }}>
            {amenities.unit.map((amenity) => (
              <FormControlLabel
                key={amenity._id}
                control={
                  <Checkbox
                    checked={selectedAmenities.unit.includes(amenity._id)}
                    onChange={() => handleAmenityChange('unit', amenity._id)}
                  />
                }
                label={amenity.name}
              />
            ))}
          </FormGroup>
        </Paper>
      </Container>

      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          px: 3,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 400,
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        Submit Listing
      </Button>
    </Box>
  );
};

export default PropertyAmenities; 