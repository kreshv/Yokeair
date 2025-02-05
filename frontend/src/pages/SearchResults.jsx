import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ApartmentCard from '../components/ApartmentCard';
import { searchService } from '../api/api';
import SortButton from '../components/SortButton';
import BrokerageCard from '../components/BrokerageCard';
import NoResults from '../components/NoResults';

const BrokeragesSection = ({ brokerages, onBrokerageClick }) => {
    if (!brokerages.length) return null;
    
    return (
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
                        <BrokerageCard 
                            brokerage={brokerage}
                            onClick={() => onBrokerageClick(brokerage._id)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const PropertiesSection = ({ apartments, onSort }) => {
    if (!apartments.length) return null;

    return (
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
                <SortButton onSort={onSort} />
            </Box>
            <Grid container spacing={3}>
                {apartments.map((apartment) => (
                    <Grid item key={apartment._id} xs={12} sm={6} md={4}>
                        <ApartmentCard apartment={apartment} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

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
        const searchParams = location.state || {};
        
        const fetchResults = async () => {
            setLoading(true);
            setError('');
            try {
                const [propertiesResult, brokeragesResult] = await Promise.all([
                    searchService.searchProperties({ 
                        search: searchQuery,
                        ...searchParams 
                    }),
                    searchService.searchBrokerages({ search: searchQuery })
                ]);

                if (!propertiesResult.success) {
                    throw new Error(propertiesResult.error);
                }
                if (!brokeragesResult.success) {
                    throw new Error(brokeragesResult.error);
                }

                setApartments(propertiesResult.data);
                setBrokerages(brokeragesResult.data);
            } catch (err) {
                console.error('Search error:', err);
                setError(err.message || 'Failed to fetch search results');
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchResults();
        }
    }, [location.search, location.state]);

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
                
                <BrokeragesSection 
                    brokerages={brokerages}
                    onBrokerageClick={handleBrokerageClick}
                />
                
                <PropertiesSection 
                    apartments={apartments}
                    onSort={handleSort}
                />

                {apartments.length === 0 && brokerages.length === 0 && (
                    <NoResults onReturnHome={() => navigate('/')} />
                )}
            </Container>
        </Box>
    );
};

export default SearchResults; 