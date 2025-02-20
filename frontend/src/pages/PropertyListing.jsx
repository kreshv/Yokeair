import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getLocations, checkUnitAvailability, createProperty, uploadPropertyImages } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { ArrowForwardIos } from '@mui/icons-material';

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
    squareFootage: '',
    price: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  const bedroomOptions = [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' }
  ];
  const bathroomOptions = ['1', '1.5', '2', '2.5', '3'];

  useEffect(() => {
    if (!user) {
      navigate('/register', { state: { fromShowcasing: true } });
    } else if (user.role !== 'broker') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
    if (!formData.squareFootage) newErrors.squareFootage = 'Square footage is required';
    if (!formData.price) newErrors.price = 'Price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
        return;
    }

    setSubmitError('');

    const propertyData = {
        ...formData,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        squareFootage: parseInt(formData.squareFootage),
        price: formData.price.replace(/[^0-9.]/g, ''),
        buildingAmenities: [],
        unitFeatures: []
    };

    if (user) {
        try {
            // Create property
            const propertyResponse = await createProperty({
                ...propertyData,
                broker: user.id
            });
            
            const propertyId = propertyResponse.data._id;
            
            navigate('/property-amenities', { 
                state: { 
                    propertyId,
                    userId: user.id,
                    images: images
                }
            });
        } catch (error) {
            console.error('Error creating property:', error);
            setSubmitError(error.response?.data?.message || 'Failed to create property. Please try again.');
            window.scrollTo(0, 0);
        }
    } else {
        navigate('/register', { 
            state: { 
                propertyData
            } 
        });
    }
  };

  const formatPrice = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
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

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)'
    }
  };

  const handleImageUpload = async (formData) => {
    try {
        console.log('PropertyListing: handleImageUpload called');
        const files = formData.getAll('image');
        console.log('PropertyListing: Files to upload:', files);
        
        if (files && files.length > 0) {
            // Store the files temporarily
            setImages(prev => [...prev, ...files]);
            setImageError('');
            console.log('PropertyListing: Images stored temporarily');
        } else {
            console.log('PropertyListing: No files in FormData');
            setImageError('No files selected');
        }
    } catch (error) {
        console.error('PropertyListing: Image upload error:', error);
        setImageError(error.message || 'Failed to upload images');
    }
  };

  const handleImageDelete = (imageToDelete) => {
    setImages(prev => prev.filter(img => img !== imageToDelete));
  };

  // Add loading overlay component
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
    </Box>
  );

  return (
    <Box
      sx={{
        pt: 12,
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
      <Container maxWidth="md">
        <Paper 
          elevation={5}
          sx={{
            p: 5,
            mt: 12,
            borderRadius: '25px',
            width: '615px',
            margin: '0 auto',
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
            Tell us about your property
          </Typography>

          {submitError && (
            <Alert 
                severity="error" 
                sx={{ 
                    mb: 3,
                    width: '100%'
                }}
            >
                {submitError}
            </Alert>
          )}

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
              sx={textFieldStyle}
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
              sx={textFieldStyle}
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
              sx={textFieldStyle}
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
              sx={textFieldStyle}
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
              sx={textFieldStyle}
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
              sx={textFieldStyle}
            >
              {bathroomOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Square Footage"
              name="squareFootage"
              value={formData.squareFootage}
              onChange={handleInputChange}
              variant="outlined"
              error={!!errors.squareFootage}
              helperText={errors.squareFootage}
              sx={textFieldStyle}
            />

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
              sx={textFieldStyle}
            />
          </Box>

          <Grid item xs={12} sx={{ mt: 4 }}>
            <ImageUpload
                onUpload={handleImageUpload}
                existingImages={images}
                onDelete={handleImageDelete}
                onError={setImageError}
                onUpdateOrder={(newImages) => setImages(newImages)}
            />
            {imageError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {imageError}
                </Typography>
            )}
          </Grid>
        </Paper>
      </Container>

      {/* Next Button */}
      <Box sx={{ 
        position: 'fixed',
        bottom: '50%',
        right: '16px',
        transform: 'translateY(50%)'
      }}>
        <IconButton 
          onClick={handleNext}
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            transform: 'scale(1.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.3) translateX(8px)',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              width: '60px',
              height: '60px'
            }
          }}
        >
          <ArrowForwardIos sx={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PropertyListing; 