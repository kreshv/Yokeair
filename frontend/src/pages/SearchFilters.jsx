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
import { getAmenities } from '../utils/api';

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
    const { neighborhoods, boroughs } = location.state || {};

    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [amenities, setAmenities] = useState({ building: [], unit: [] });

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

    const handleSearch = () => {
        console.log('Sending search params:', {
            neighborhoods,
            boroughs,
            bedrooms,
            bathrooms,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            amenities: selectedAmenities,
            features: selectedFeatures
        });

        navigate('/apartments', {
            state: {
                neighborhoods,
                boroughs,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                bedrooms,
                bathrooms,
                amenities: selectedAmenities,
                features: selectedFeatures
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
                        background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.8), rgba(236, 229, 221, 0.7))',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(211, 211, 211, 0.3)'
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
                            min={0}
                            max={10000}
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
                        {amenities.unit.map((feature) => (
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
                Search
            </Button>
        </Box>
    );
};

export default SearchFilters; 