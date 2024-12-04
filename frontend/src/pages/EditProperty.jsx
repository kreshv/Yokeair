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
    const [property, setProperty] = useState(null);
    const [price, setPrice] = useState('');
    const [squareFootage, setSquareFootage] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const features = [
        { id: '1', name: 'Balcony' },
        { id: '2', name: 'Terrace' },
        { id: '3', name: 'Backyard' },
        { id: '4', name: 'Dishwasher' },
        { id: '5', name: 'Washer/Dryer' }
    ];

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await getProperty(id);
                const propertyData = response.data;
                setProperty(propertyData);
                setPrice(formatPrice(propertyData.price));
                setSquareFootage(propertyData.squareFootage);
                setSelectedFeatures(propertyData.features.map(f => f._id));
                setLoading(false);
            } catch (err) {
                setError('Failed to load property');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    const formatPrice = (value) => {
        if (!value) return '';
        const numberValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        return numberValue ? `$${numberValue.toLocaleString()}` : '';
    };

    const handlePriceChange = (event) => {
        const rawValue = event.target.value.replace(/[^0-9]/g, '');
        setPrice(formatPrice(rawValue));
    };

    const handleFeatureToggle = (featureId) => {
        setSelectedFeatures(prev => 
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        );
    };

    const handleImageUpload = async (formData) => {
        try {
            await uploadPropertyImages(id, formData);
            // Refresh property data to show new images
            const response = await getProperty(id);
            setProperty(response.data);
        } catch (error) {
            setError('Failed to upload images');
        }
    };

    const handleSubmit = async () => {
        try {
            const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
            await updateProperty(id, {
                price: numericPrice,
                squareFootage: parseInt(squareFootage),
                features: selectedFeatures
            });
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to update property');
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

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Grid container spacing={3} direction="column">
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Price"
                                value={price}
                                onChange={handlePriceChange}
                                sx={{
                                    mb: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Square Footage"
                                value={squareFootage}
                                onChange={(e) => setSquareFootage(e.target.value)}
                                type="text"
                                InputProps={{
                                    inputProps: {
                                        min: undefined,
                                        step: undefined
                                    }
                                }}
                                sx={{
                                    mb: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#00008B' }}>
                        Unit Features
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                        {features.map((feature) => (
                            <FeatureButton
                                key={feature.id}
                                name={feature.name}
                                selected={selectedFeatures.includes(feature.id)}
                                onClick={() => handleFeatureToggle(feature.id)}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#00008B' }}>
                        Property Images
                    </Typography>
                    <ImageUpload
                        onUpload={handleImageUpload}
                        existingImages={property?.images || []}
                    />

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={handleSubmit}
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 400,
                                color: '#000',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '20px',
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
                </Paper>
            </Container>
        </Box>
    );
};

export default EditProperty;