import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Paper
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ApartmentCard from '../components/ApartmentCard';
import { searchProperties, searchBrokerages } from '../utils/api';
import { LocationOnOutlined, Phone, Email } from '@mui/icons-material';
import SortButton from '../components/SortButton';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [apartments, setApartments] = useState([]);
    const [brokerages, setBrokerages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        const searchQuery = new URLSearchParams(location.search).get('search');
        
        const fetchResults = async () => {
            setLoading(true);
            setError('');
            try {
                // Search for both apartments and brokerages in parallel
                const [apartmentsResponse, brokeragesResponse] = await Promise.all([
                    searchProperties({ search: searchQuery }),
                    searchBrokerages({ search: searchQuery })
                ]);

                setApartments(apartmentsResponse.data);
                setBrokerages(brokeragesResponse.data);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch search results');
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchResults();
        }
    }, [location.search]);

    const handleBrokerageClick = (brokerId) => {
        navigate(`/broker/${brokerId}`);
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design3.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                py: 4,
                mt: 0
            }}
        >
            <Container sx={{ mt: 10 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* Brokerages Section */}
                {brokerages.length > 0 && (
                    <Box sx={{ mb: 6 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#FFFFFF',
                                mb: 3,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                fontSize: '1.1rem',
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            Matching Brokerages
                        </Typography>
                        <Grid container spacing={3}>
                            {brokerages.map((brokerage) => (
                                <Grid item xs={12} sm={6} md={4} key={brokerage._id}>
                                    <Paper
                                        onClick={() => handleBrokerageClick(brokerage._id)}
                                        sx={{
                                            p: 3,
                                            borderRadius: '15px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                            }
                                        }}
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            {brokerage.firstName} {brokerage.lastName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Email sx={{ mr: 1, fontSize: '0.9rem', color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {brokerage.email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Phone sx={{ mr: 1, fontSize: '0.9rem', color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {brokerage.phone}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Apartments Section */}
                {apartments.length > 0 && (
                    <Box>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 3 
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    fontSize: '1.1rem',
                                    textShadow: '0 0 10px rgba(255, 255, 255, 0.15)'
                                }}
                            >
                                Matching Properties
                            </Typography>
                            <SortButton onSort={handleSort} />
                        </Box>
                        <Grid container spacing={3}>
                            {apartments.map((apartment) => (
                                <Grid item key={apartment._id} xs={12} sm={6} md={4}>
                                    <ApartmentCard apartment={apartment} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {apartments.length === 0 && brokerages.length === 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: '50vh',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                            No results found
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#000',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                }
                            }}
                        >
                            Return Home
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default SearchResults; 