import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Modal,
    Paper,
    Typography,
    IconButton,
    Grid,
    Chip,
    CircularProgress,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getProperty } from '../api';
import ImageGallery from '../components/ImageGallery';

const PropertyDetail = ({ isModal = false, onClose }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await getProperty(id);
                setProperty(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property details');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    const handleClose = () => {
        if (isModal) {
            onClose();
        } else {
            navigate('/');
        }
    };

    const content = (
        <Box sx={{ 
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: isModal ? 2 : 0,
            position: 'relative'
        }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" align="center">{error}</Typography>
            ) : property && (
                <>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            zIndex: 1
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <ImageGallery images={property.images || []} />
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" gutterBottom>
                                {property.building.address.street} - Unit {property.unitNumber}
                            </Typography>
                            <Typography variant="h5" color="primary" gutterBottom>
                                ${property.price.toLocaleString()}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {property.bedrooms} BR | {property.bathrooms} Bath
                                {property.squareFootage > 0 && ` | ${property.squareFootage} sq ft`}
                            </Typography>
                            
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Unit Features
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                {property.features?.map(feature => (
                                    <Chip
                                        key={feature.name}
                                        label={feature.name}
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Building Amenities
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                {property.building?.amenities?.map(amenity => (
                                    <Chip
                                        key={amenity.name}
                                        label={amenity.name}
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Location
                            </Typography>
                            <Typography variant="body1">
                                {property.building.address.street}, {property.building.address.neighborhood}, {property.building.address.borough}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    Schedule a Viewing
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                >
                                    Contact Agent
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );

    if (isModal) {
        return (
            <Modal
                open={true}
                onClose={handleClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2
                }}
            >
                {content}
            </Modal>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            pt: 8 // Add padding top to account for navbar
        }}>
            {content}
        </Box>
    );
};

export default PropertyDetail; 