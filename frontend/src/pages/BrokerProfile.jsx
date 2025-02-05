import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Grid, CircularProgress, Paper, Avatar } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import ApartmentCard from '../components/ApartmentCard';
import SortButton from '../components/SortButton';
import { getBrokerPublicListings } from '../utils/api';

const BrokerProfile = () => {
    const { brokerId } = useParams();
    const [listings, setListings] = useState([]);
    const [broker, setBroker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBrokerData = async () => {
            try {
                setLoading(true);
                const response = await getBrokerPublicListings(brokerId);
                if (response.data) {
                    setListings(response.data.properties || []);
                    setBroker({
                        name: `${response.data.firstName} ${response.data.lastName}`,
                        email: response.data.email,
                        phone: response.data.phone || 'Not provided',
                        profilePicture: response.data.profilePicture
                    });
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching broker data:', err);
                setError('Failed to load broker information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBrokerData();
    }, [brokerId]);

    const handleSort = (sortType) => {
        let sortedListings = [...listings];
        switch (sortType) {
            case 'price_asc':
                sortedListings.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sortedListings.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }
        setListings(sortedListings);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Box textAlign="center" py={4}>
                    <Typography color="error" variant="h6">
                        {error}
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat',
                pt: 10,
                pb: 4
            }}
        >
            <Container maxWidth="lg">
                {broker && (
                    <Box 
                        sx={{ 
                            p: 3,
                            borderRadius: '16px',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Avatar
                                src={broker.profilePicture}
                                alt={broker.name}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    border: '3px solid',
                                    borderColor: 'primary.main'
                                }}
                            >
                                {!broker.profilePicture && broker.name.charAt(0)}
                            </Avatar>
                            
                            <Box>
                                <Typography variant="h5" sx={{ mb: 2, color: 'white', fontWeight: 500 }}>
                                    {broker.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <EmailIcon sx={{ mr: 1, color: 'white', fontSize: 20 }} />
                                    <Typography variant="body1" sx={{ color: 'white' }}>
                                        {broker.email}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ mr: 1, color: 'white', fontSize: 20 }} />
                                    <Typography variant="body1" sx={{ color: 'white' }}>
                                        {broker.phone}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {listings.length === 0 ? (
                            <Typography 
                                variant="body1"
                                sx={{ color: 'white' }}
                            >
                                This broker currently has no available listings.
                            </Typography>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                    <SortButton onSort={handleSort} />
                                </Box>
                                <Grid container spacing={3}>
                                    {listings.map((listing) => (
                                        <Grid item xs={12} sm={6} md={4} key={listing._id}>
                                            <ApartmentCard apartment={listing} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default BrokerProfile; 