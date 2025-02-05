import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import { getSavedListings } from '../../utils/api';
import ApartmentCard from '../../components/ApartmentCard';
import { useNavigate } from 'react-router-dom';
import '@fontsource/raleway';

const SavedListings = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSavedListings = async () => {
        try {
            const response = await getSavedListings();
            setListings(response.data);
        } catch (err) {
            setError('Failed to load saved listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedListings();
    }, []);

    const handleSearchApartments = () => {
        navigate('/location-selector');
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
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design4.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                py: 4,
                mt: 0
            }}
        >
            <Container sx={{ mt: 10 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 4 
                }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 530,
                            mb: 10,
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            fontSize: '1.25rem',
                            textAlign: 'center',
                            fontFamily: 'Raleway, sans-serif',
                            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                left: '50%',
                                bottom: '-2px',
                                width: '80%',
                                height: '1px',
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                transform: 'translateX(-50%)',
                                borderRadius: '1px',
                            },
                        }}
                    >
                        Saved Listings
                    </Typography>
                    <Button 
                        variant="contained"
                        onClick={handleSearchApartments}
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
                        Search Apartments
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {listings.map((listing) => (
                        <Grid item key={listing._id} xs={12} sm={6} md={4}>
                            <ApartmentCard 
                                apartment={listing} 
                                showSaveButton={true}
                                isSaved={true}
                                amenities={listing.building?.amenities || []}
                                features={listing.features || []}
                            />
                        </Grid>
                    ))}
                    {listings.length === 0 && (
                        <Grid item xs={12}>
                            <Typography textAlign="center" color="#FFFFFF">
                                No saved listings found.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default SavedListings; 