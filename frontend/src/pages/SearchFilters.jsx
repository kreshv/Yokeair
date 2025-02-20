import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Slider,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Divider
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAmenities, getUnitFeatures } from '../utils/api';

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

const SearchFilters = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse locations from URL parameters instead of location.state
    const searchParams = new URLSearchParams(location.search);
    const neighborhoods = searchParams.get('neighborhoods')?.split(',') || [];
    const boroughs = searchParams.get('boroughs')?.split(',') || [];

    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [amenities, setAmenities] = useState({ building: [], unit: [] });
    const [unitFeatures, setUnitFeatures] = useState([]);

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await getAmenities();
                setAmenities({
                    building: response.data.filter(a => a.type === 'building'),
                    unit: response.data.filter(a => a.type === 'unit')
                });
            } catch (error) {
                console.error('Error fetching amenities:', error);
            }
        };

        fetchAmenities();
    }, []);

    useEffect(() => {
        const fetchUnitFeatures = async () => {
            try {
                const response = await getUnitFeatures();
                setUnitFeatures(response.data);
            } catch (error) {
                console.error('Error fetching unit features:', error);
            }
        };
        fetchUnitFeatures();
    }, []);

    // Add function to handle search with all parameters
    const handleSearch = () => {
        const params = new URLSearchParams();

        // Add locations (exact match)
        if (neighborhoods.length > 0) {
            params.set('neighborhoods', neighborhoods.join(','));
        }
        if (boroughs.length > 0) {
            params.set('boroughs', boroughs.join(','));
        }

        // Add price range (exact match)
        params.set('minPrice', priceRange[0].toString());
        params.set('maxPrice', priceRange[1].toString());
        
        // Add rooms (exact match)
        if (bedrooms !== '') {
            params.set('bedrooms', bedrooms.toString());
        }
        if (bathrooms !== '') {
            params.set('bathrooms', bathrooms.toString());
        }
        
        // Add amenities and features (at least match)
        if (selectedAmenities.length > 0) {
            params.set('amenities', selectedAmenities.join(','));
            params.set('amenitiesMatchType', 'atLeast');
        }
        
        if (selectedFeatures.length > 0) {
            params.set('features', selectedFeatures.join(','));
            params.set('featuresMatchType', 'atLeast');
        }

        // Update URL without causing a reload
        window.history.replaceState(
            { 
                neighborhoods,
                boroughs,
                priceRange,
                bedrooms,
                bathrooms,
                selectedAmenities,
                selectedFeatures
            },
            '',
            `/apartments?${params.toString()}`
        );

        // Navigate programmatically
        navigate(`/apartments?${params.toString()}`, {
            replace: true,
            state: {
                neighborhoods,
                boroughs,
                priceRange,
                bedrooms,
                bathrooms,
                selectedAmenities,
                selectedFeatures
            }
        });
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)'
        },
        '& .MuiSelect-select': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)'
        }
    };

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
            <Container maxWidth="sm">
                <Paper
                    elevation={5}
                    sx={{
                        p: 4,
                        mt: '10vh',
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
                    <Typography variant="h5" gutterBottom sx={{ color: '#00008B', fontSize: '1.2rem' }}>
                        Additional Filters
                    </Typography>

                    <Box sx={{ my: 2 }}>
                        <Typography gutterBottom>Price Range</Typography>
                        <Slider
                            value={priceRange}
                            onChange={(e, newValue) => setPriceRange(newValue)}
                            valueLabelDisplay="auto"
                            min={2000}
                            max={6000}
                            step={100}
                            valueLabelFormat={value => `$${value}`}
                        />
                    </Box>

                    <Box sx={{ my: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Bedrooms</InputLabel>
                            <Select
                                value={bedrooms}
                                onChange={(e) => setBedrooms(e.target.value)}
                                label="Bedrooms"
                                sx={textFieldStyle}
                            >
                                <MenuItem value="">Any</MenuItem>
                                <MenuItem value={0}>Studio</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4+</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Bathrooms</InputLabel>
                            <Select
                                value={bathrooms}
                                onChange={(e) => setBathrooms(e.target.value)}
                                label="Bathrooms"
                                sx={textFieldStyle}
                            >
                                <MenuItem value="">Any</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={1.5}>1.5</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={2.5}>2.5</MenuItem>
                                <MenuItem value={3}>3+</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 1, color: '#00008B' }}>
                        Building Amenities
                    </Typography>
                    <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {amenities.building.map((amenity) => (
                            <AmenityButton
                                key={amenity._id}
                                name={amenity.name}
                                selected={selectedAmenities.includes(amenity._id)}
                                onClick={() => {
                                    setSelectedAmenities(prev => 
                                        prev.includes(amenity._id)
                                            ? prev.filter(id => id !== amenity._id)
                                            : [...prev, amenity._id]
                                    );
                                }}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#00008B' }}>
                        Unit Features
                    </Typography>
                    <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {unitFeatures.map((feature) => (
                            <AmenityButton
                                key={feature._id}
                                name={feature.name}
                                selected={selectedFeatures.includes(feature._id)}
                                onClick={() => {
                                    setSelectedFeatures(prev => 
                                        prev.includes(feature._id)
                                            ? prev.filter(id => id !== feature._id)
                                            : [...prev, feature._id]
                                    );
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
            </Container>

            <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    px: 2.25,
                    py: 0.6,
                    fontSize: '1rem',
                    fontWeight: 400,
                    color: '#000',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '15px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-4px)',
                        color: '#4169E1',
                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                    }
                }}
            >
                Show Results
            </Button>
        </Box>
    );
};

export default SearchFilters; 