import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSavedListings, removeSavedListing } from '../../utils/api';
import ApartmentCard from '../../components/ApartmentCard';

const SavedListings = () => {
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

    const handleRemove = async (listingId) => {
        try {
            await removeSavedListing(listingId);
            setListings(prev => prev.filter(listing => listing._id !== listingId));
        } catch (err) {
            setError('Failed to remove listing');
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
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design4.png")`,
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
                        background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.9), rgba(236, 229, 221, 0.8))',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 4, color: '#00008B' }}>
                        Saved Listings
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {listings.map((listing) => (
                            <Grid item key={listing._id} xs={12} md={6}>
                                <Box sx={{ position: 'relative' }}>
                                    <ApartmentCard 
                                        apartment={listing} 
                                        showSaveButton={false}
                                    />
                                    <IconButton
                                        onClick={() => handleRemove(listing._id)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                color: 'error.main'
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                        {listings.length === 0 && (
                            <Grid item xs={12}>
                                <Typography textAlign="center" color="textSecondary">
                                    No saved listings found
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default SavedListings; 