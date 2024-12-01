import { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  MenuItem,
  Typography 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getLocations, checkUnitAvailability, createProperty } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PropertyListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBorough, setSelectedBorough] = useState('');
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [formData, setFormData] = useState({
    address: '',
    borough: '',
    neighborhood: '',
    unitNumber: '',
    bedrooms: '',
    bathrooms: '',
    price: ''
  });
  const [errors, setErrors] = useState({});

  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  const bedroomOptions = [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' }
  ];
  const bathroomOptions = ['1', '1.5', '2', '2.5', '3', '3.5', '4'];

  const handleBoroughChange = async (event) => {
    const borough = event.target.value;
    setSelectedBorough(borough);
    setFormData(prev => ({ ...prev, borough, neighborhood: '' }));
    
    try {
      const response = await getLocations();
      const boroughData = response.data.find(loc => loc.borough === borough);
      setNeighborhoods(boroughData?.neighborhoods || []);
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'price') {
      // Format price input
      const numericValue = value.replace(/[^0-9]/g, '');
      const formattedValue = numericValue ? `$${Number(numericValue).toLocaleString()}` : '';
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUnitNumberChange = async (event) => {
    const { value } = event;
    handleInputChange(event);
    
    if (value && formData.address && formData.borough) {
      try {
        await checkUnitAvailability(formData.address, formData.borough, value);
      } catch (error) {
        if (error.response?.status === 409) {
          setErrors(prev => ({
            ...prev,
            unitNumber: 'This unit already exists in the building'
          }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.borough) newErrors.borough = 'Borough is required';
    if (!formData.neighborhood) newErrors.neighborhood = 'Neighborhood is required';
    if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
    if (!formData.bedrooms && formData.bedrooms !== 0) newErrors.bedrooms = 'Bedrooms is required';
    if (!formData.bathrooms) newErrors.bathrooms = 'Bathrooms is required';
    if (!formData.price) newErrors.price = 'Price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Format the data
    const propertyData = {
      ...formData,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseFloat(formData.bathrooms),
      price: formData.price.replace(/[^0-9.]/g, ''),
      buildingAmenities: [],
      unitFeatures: []
    };

    if (user) {
      // If user is logged in, create property directly and go to amenities
      try {
        const propertyResponse = await createProperty({
          ...propertyData,
          broker: user.id
        });
        
        navigate('/property-amenities', { 
          state: { 
            propertyId: propertyResponse.data._id,
            userId: user.id 
          }
        });
      } catch (error) {
        console.error('Error creating property:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to create property. Please try again.'
        }));
      }
    } else {
      // If not logged in, go to register with property data
      navigate('/register', { 
        state: { 
          propertyData
        } 
      });
    }
  };

  const formatPrice = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Convert to number and format with commas
    if (numericValue) {
      const number = parseInt(numericValue, 10);
      return `$${number.toLocaleString()}`;
    }
    return '';
  };

  const handlePriceChange = (event) => {
    const { value } = event.target;
    const formattedPrice = formatPrice(value);
    setFormData(prev => ({
      ...prev,
      price: formattedPrice
    }));
  };

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
            mt: '20vh',
            borderRadius: '25px',
            background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.8), rgba(236, 229, 221, 0.7))',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(211, 211, 211, 0.3)',
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
            Tell us about your property
          </Typography>

          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <TextField
              fullWidth
              label="Address (example: 123 Main Street)"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              variant="outlined"
              error={!!errors.address}
              helperText={errors.address}
            />

            <TextField
              select
              fullWidth
              label="Borough"
              name="borough"
              value={formData.borough}
              onChange={handleBoroughChange}
              variant="outlined"
              error={!!errors.borough}
              helperText={errors.borough}
            >
              {boroughs.map((borough) => (
                <MenuItem key={borough} value={borough}>
                  {borough}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Neighborhood"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!formData.borough}
              error={!!errors.neighborhood}
              helperText={errors.neighborhood}
            >
              {neighborhoods.map((neighborhood) => (
                <MenuItem key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Unit Number"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleUnitNumberChange}
              variant="outlined"
              error={!!errors.unitNumber}
              helperText={errors.unitNumber}
            />

            <TextField
              select
              fullWidth
              label="Bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              variant="outlined"
              error={!!errors.bedrooms}
              helperText={errors.bedrooms}
            >
              {bedroomOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              variant="outlined"
              error={!!errors.bathrooms}
              helperText={errors.bathrooms}
            >
              {bathroomOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Price"
              name="price"
              value={formData.price}
              onChange={handlePriceChange}
              variant="outlined"
              placeholder="$0,000"
              error={!!errors.price}
              helperText={errors.price}
              InputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
            />
          </Box>
        </Paper>
      </Container>

      {/* Next Button */}
      <Button
        variant="contained"
        onClick={handleNext}
        sx={{
          position: 'absolute',
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
        Next
      </Button>
    </Box>
  );
};

export default PropertyListing; 