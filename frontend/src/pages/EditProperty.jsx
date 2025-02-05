import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { getProperty, updateProperty, uploadPropertyImages } from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import { useSnackbar } from '../context/SnackbarContext';

const FeatureButton = ({ name, selected, onClick }) => (
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

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const [property, setProperty] = useState(null);
    const [price, setPrice] = useState('');
    const [squareFootage, setSquareFootage] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imagesToDelete, setImagesToDelete] = useState([]);

    const features = [
        'Balcony',
        'Terrace',
        'Backyard',
        'Dishwasher',
        'Washer/Dryer'
    ];

    const amenities = [
        'Elevator',
        'Gym',
        'Rooftop',
        'Storage',
        'Bike room',
        'Laundry in building',
        'Lounge',
        'Garage parking',
        'Package room'
    ];

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await getProperty(id);
                const propertyData = response.data;
                console.log('Fetched property data:', propertyData);
                
                // Set basic property data
                setProperty(propertyData);
                setPrice(formatPrice(propertyData.price));
                setSquareFootage(propertyData.squareFootage?.toString() || '');
                
                // Set features
                const featureNames = propertyData.features?.map(feature => feature.name) || [];
                setSelectedFeatures(featureNames);
                
                // Set building amenities based on our predefined list
                if (propertyData.building?.amenities && Array.isArray(propertyData.building.amenities)) {
                    const amenityNames = propertyData.building.amenities.map(amenity => amenity.name);
                    console.log('Mapped amenity names:', amenityNames);
                    setSelectedAmenities(amenityNames);
                } else {
                    console.log('No building amenities found');
                    setSelectedAmenities([]);
                }
                
                // Set images
                setImages(propertyData.images || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    const formatPrice = (value) => {
        if (!value) return '';
        const stringValue = typeof value === 'number' ? value.toString() : value;
        const numberValue = parseFloat(stringValue.replace(/[^0-9.]/g, ''));
        return numberValue ? `$${numberValue.toLocaleString()}` : '';
    };

    const handlePriceChange = (event) => {
        const rawValue = event.target.value.replace(/[^0-9]/g, '');
        setPrice(formatPrice(rawValue));
    };

    const handleFeatureToggle = (featureName) => {
        setSelectedFeatures(prev => 
            prev.includes(featureName)
                ? prev.filter(name => name !== featureName)
                : [...prev, featureName]
        );
    };

    const handleAmenityToggle = (amenityName) => {
        setSelectedAmenities(prev => 
            prev.includes(amenityName)
                ? prev.filter(name => name !== amenityName)
                : [...prev, amenityName]
        );
    };

    const handleImageUpload = async (formData) => {
        try {
            setError('');
            setUploading(true);
            const file = formData.get('image'); // Ensure the field name matches
            
            if (!file) {
                setError('No file selected');
                return;
            }

            // Validate file size
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                setError(`File ${file.name} is too large (max 5MB)`);
                return;
            }

            // Upload the file
            const uploadResponse = await uploadPropertyImages(id, formData);

            // Check if the response has updated images
            if (uploadResponse && uploadResponse.data && uploadResponse.data.images) {
                setImages(uploadResponse.data.images);
                setProperty(prev => ({ ...prev, images: uploadResponse.data.images }));
            } else {
                // Fallback: Refresh property data to get new images
                const response = await getProperty(id);
                setProperty(response.data);
                setImages(response.data.images || []);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleImageDelete = async (imageToDelete) => {
        try {
            // Immediately remove the image from the local state for instant UI update
            const updatedImages = images.filter(image => 
                image.url !== imageToDelete.url && image.public_id !== imageToDelete.public_id
            );

            setImages(updatedImages);
            setProperty(prevProperty => ({
                ...prevProperty,
                images: updatedImages
            }));
            
            // Update the property with the filtered images in the backend
            await updateProperty(id, { images: updatedImages });

            showSnackbar('Image deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting image:', err);
            showSnackbar('Failed to delete image', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
            const numericSquareFootage = parseInt(squareFootage);

            if (isNaN(numericPrice) || numericPrice <= 0) {
                setError('Please enter a valid price');
                return;
            }

            const updateData = {
                price: numericPrice,
                squareFootage: numericSquareFootage || 0,
                features: selectedFeatures,
                buildingAmenities: selectedAmenities,
                images: images.map(img => ({
                    url: img.url,
                    public_id: img.public_id
                }))
            };

            const response = await updateProperty(id, updateData);
            setProperty(response.data);
            showSnackbar('Property updated successfully', 'success');
            
            // Get the return path and state from localStorage
            const returnPath = localStorage.getItem('returnPath');
            const returnState = localStorage.getItem('returnState');
            
            // Clear the stored paths
            localStorage.removeItem('returnPath');
            localStorage.removeItem('returnState');
            
            // Navigate back to the previous page with the stored state
            navigate(returnPath || '/dashboard', {
                state: returnState ? JSON.parse(returnState) : undefined
            });
        } catch (error) {
            console.error('Error updating property:', error);
            setError('Failed to update property. Please try again.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                py: 4
            }}
        >
            <Container>
                <Paper
                    sx={{
                        p: 4,
                        mt: 12,
                        borderRadius: '25px',
                        width: '600px',
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
                    <Typography variant="h5" sx={{ mb: 4, color: '#00008B' }}>
                        Edit Listing
                    </Typography>
                    {property && (
                        <>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    mb: 3, 
                                    color: '#000',
                                    fontWeight: 350,
                                    fontSize: '1.5rem'
                                }}
                            >
                                {property.building.address.street} - Unit {property.unitNumber}
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        value={price}
                                        onChange={handlePriceChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Square Footage"
                                        value={squareFootage}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setSquareFootage(value);
                                        }}
                                        type="text"
                                        InputProps={{
                                            inputMode: 'numeric',
                                            pattern: '[0-9]*'
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#00008B' }}>
                                    Unit Features
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                                    {features.map((feature) => (
                                        <FeatureButton
                                            key={feature}
                                            name={feature}
                                            selected={selectedFeatures.includes(feature)}
                                            onClick={() => handleFeatureToggle(feature)}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#00008B' }}>
                                    Building Amenities
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                                    {amenities.map((amenity) => (
                                        <FeatureButton
                                            key={amenity}
                                            name={amenity}
                                            selected={selectedAmenities.includes(amenity)}
                                            onClick={() => handleAmenityToggle(amenity)}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <ImageUpload
                                    onUpload={handleImageUpload}
                                    existingImages={images}
                                    onDelete={handleImageDelete}
                                    onUpdateOrder={(newImages) => setImages(newImages)}
                                    onError={(errorMessage) => {
                                        setError(errorMessage);
                                        showSnackbar(errorMessage, 'error');
                                    }}
                                />
                                {uploading && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <CircularProgress />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                sx={{
                                    px: 2.5,
                                    py: 1,
                                    fontSize: '1rem',
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
                                Save Changes
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditProperty;