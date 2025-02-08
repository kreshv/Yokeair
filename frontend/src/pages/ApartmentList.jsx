import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProperties } from '../utils/api';
import ApartmentCard from '../components/ApartmentCard';
import SortButton from '../components/SortButton';

const ApartmentList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                setLoading(true);
                const searchParams = new URLSearchParams(location.search);
                const filters = {};
                
                // Add neighborhoods
                const neighborhoods = searchParams.getAll('neighborhoods[]');
                if (neighborhoods.length > 0) {
                    filters.neighborhoods = neighborhoods.join(',');
                } else {
                    const neighborhoodsStr = searchParams.get('neighborhoods');
                    if (neighborhoodsStr) {
                        filters.neighborhoods = neighborhoodsStr;
                    }
                }
                
                // Add boroughs
                const boroughs = searchParams.getAll('boroughs[]');
                if (boroughs.length > 0) {
                    filters.boroughs = boroughs.join(',');
                } else {
                    const boroughsStr = searchParams.get('boroughs');
                    if (boroughsStr) {
                        filters.boroughs = boroughsStr;
                    }
                }
                
                // Add price range
                const minPrice = searchParams.get('minPrice');
                const maxPrice = searchParams.get('maxPrice');
                if (minPrice) filters.minPrice = minPrice;
                if (maxPrice) filters.maxPrice = maxPrice;
                
                // Add rooms
                const bedrooms = searchParams.get('bedrooms');
                const bathrooms = searchParams.get('bathrooms');
                if (bedrooms) filters.bedrooms = bedrooms;
                if (bathrooms) filters.bathrooms = bathrooms;
                
                // Add amenities and features with match types
                const amenities = searchParams.getAll('amenities[]');
                if (amenities.length > 0) {
                    filters.amenities = amenities.join(',');
                    filters.amenitiesMatchType = searchParams.get('amenitiesMatchType') || 'exact';
                } else {
                    const amenitiesStr = searchParams.get('amenities');
                    if (amenitiesStr) {
                        filters.amenities = amenitiesStr;
                        filters.amenitiesMatchType = searchParams.get('amenitiesMatchType') || 'exact';
                    }
                }
                
                const features = searchParams.getAll('features[]');
                if (features.length > 0) {
                    filters.features = features.join(',');
                    filters.featuresMatchType = searchParams.get('featuresMatchType') || 'exact';
                } else {
                    const featuresStr = searchParams.get('features');
                    if (featuresStr) {
                        filters.features = featuresStr;
                        filters.featuresMatchType = searchParams.get('featuresMatchType') || 'exact';
                    }
                }

                const response = await searchProperties(filters);
                setApartments(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching apartments:', error);
                setError('Failed to fetch apartments');
                setLoading(false);
            }
        };

        fetchApartments();
    }, [location.search]); // Re-fetch when URL parameters change

    const handleRefineSearch = () => {
        navigate('/location-selector', { state: { neighborhoods: [], boroughs: [], minPrice: 0, maxPrice: 100000, bedrooms: null, bathrooms: null, amenities: [], features: [] } });
    };

    const handleSort = (sortType) => {
        let sortedApartments = [...apartments];
        switch (sortType) {
            case 'price_asc':
                sortedApartments.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sortedApartments.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }
        setApartments(sortedApartments);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design3.png")`,
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
                minHeight: '100vh',
                width: '100%',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design1.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                py: 4,
                mt: 0
            }}
        >
            <Container sx={{ mt: 10 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleRefineSearch}
                        sx={{
                            px: 2.5,
                            py: 1.2,
                            fontSize: '0.9rem',
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
                        Refine Listings
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
                    <SortButton onSort={handleSort} />
                </Box>
                <Grid container spacing={3}>
                    {apartments.map((apartment) => (
                        <Grid item key={apartment._id} xs={12} sm={6} md={4}>
                            <ApartmentCard apartment={apartment} />
                        </Grid>
                    ))}
                </Grid>
                {apartments.length === 0 && (
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 3,
                            minHeight: '60vh' 
                        }}
                    >
                        <Typography sx={{ color: 'white' }}>
                            No apartments found matching your criteria.
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default ApartmentList; 