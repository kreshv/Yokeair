import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProperties } from '../utils/api';
import ApartmentCard from '../components/ApartmentCard';
import SortButton from '../components/SortButton';

const ApartmentList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = location.state || {};
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApartments = async () => {
            try {
                setLoading(true);
                const response = await searchProperties(searchParams);
                setApartments(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load apartments');
                setLoading(false);
            }
        };

        fetchApartments();
    }, [searchParams]);

    const handleRefineSearch = () => {
        navigate('/search-filters', { state: searchParams });
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
                    background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design3.jpg")`,
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
                {apartments.length > 0 ? (
                    <>
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
                                Refine Search
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
                    </>
                ) : (
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
                            Refine Search
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default ApartmentList; 