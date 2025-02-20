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
import { getAmenities, updateProperty, uploadPropertyImages, getUnitFeatures } from '../utils/api';

const AmenityButton = ({ name, selected, onClick }) => (
  <Button
    variant="text"
    onClick={onClick}
    sx={{
      px: 3,
      py: 1,
      fontSize: '0.9rem',
      fontWeight: 500,
      color: 'black',
      textTransform: 'none',
      letterSpacing: '0.5px',
      borderRadius: '20px',
      position: 'relative',
      justifyContent: 'flex-start',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: '80%',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '7%',
        right: '40%',
        height: '2px',
        backgroundColor: '#00008B',
        transform: selected ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease-in-out',
        transformOrigin: 'left',
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        '&::after': {
          transform: 'scaleX(1)',
        }
      }
    }}
  >
    {name}
  </Button>
);

const PropertyAmenities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId, userId } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [amenities, setAmenities] = useState({
    building: [],
    unit: []
  });
  const [unitFeatures, setUnitFeatures] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState({
    building: [],
    unit: []
  });

  useEffect(() => {
    if (!propertyId || !userId) {
      navigate('/property-listing');
      return;
    }

    const fetchData = async () => {
      try {
        const [amenitiesResponse, unitFeaturesResponse] = await Promise.all([
          getAmenities(),
          getUnitFeatures()
        ]);
        
        setAmenities({
          building: amenitiesResponse.data.filter(a => a.type === 'building'),
          unit: []
        });
        setUnitFeatures(unitFeaturesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load amenities and features');
        setLoading(false);
      }
    };

    fetchData();
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
    setLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
        console.log('Submitting property update for ID:', propertyId);
        const updateData = {
            buildingAmenities: selectedAmenities.building.map(id => {
                const amenity = amenities.building.find(a => a._id === id);
                return amenity.name;
            }),
            features: selectedAmenities.unit
        };
        console.log('Update data:', updateData);

        // First update the property with amenities
        await updateProperty(propertyId, updateData);

        // If there are images, upload them
        if (location.state?.images && location.state.images.length > 0) {
            try {
                // Create a single FormData with all images
                const formData = new FormData();
                for (const file of location.state.images) {
                    formData.append('image', file);
                }
                
                // Upload all images in one request with progress tracking
                await uploadPropertyImages(propertyId, formData, (progress) => {
                    setUploadProgress(progress);
                });
            } catch (error) {
                console.error('Upload error:', error);
                if (error.message !== 'Images uploaded successfully') {
                    setError(error.message || 'Failed to upload images');
                    setLoading(false);
                    return;
                }
            }
        }

        navigate('/dashboard');
    } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Failed to update property');
    } finally {
        setLoading(false);
        setUploadProgress(0);
    }
  };

  const LoadingOverlay = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} sx={{ color: 'white' }} />
      {uploadProgress > 0 && (
        <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
          Uploading Images: {uploadProgress}%
        </Typography>
      )}
    </Box>
  );

  if (loading && !uploadStatus) {
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
      {loading && <LoadingOverlay />}
      <Container maxWidth="sm">
        <Paper 
          elevation={5}
          sx={{
            p: 4,
            mt: 12,
            borderRadius: '25px',
            background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.9), rgba(236, 229, 221, 0.8))',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(255, 255, 255, 0.3)',
            }
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
          <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {amenities.building.map((amenity) => (
              <AmenityButton
                key={amenity._id}
                name={amenity.name}
                selected={selectedAmenities.building.includes(amenity._id)}
                onClick={() => handleAmenityChange('building', amenity._id)}
              />
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#00008B' }}>
            Unit Features
          </Typography>
          <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {unitFeatures.map((feature) => (
              <AmenityButton
                key={feature._id}
                name={feature.name}
                selected={selectedAmenities.unit.includes(feature._id)}
                onClick={() => handleAmenityChange('unit', feature._id)}
              />
            ))}
          </Box>
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
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            transform: 'translateY(-4px)',
            color: '#00008B',
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