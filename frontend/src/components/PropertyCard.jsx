import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip
} from '@mui/material';
import PropertyDetail from '../pages/PropertyDetail';

const PropertyCard = ({ property }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        // If we're on the homepage, show the modal
        if (location.pathname === '/') {
            setModalOpen(true);
            // Update the URL without triggering a page reload
            window.history.pushState({}, '', `/properties/${property._id}`);
        } else {
            // Otherwise, navigate to the property detail page
            navigate(`/properties/${property._id}`);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        // Restore the original URL when closing the modal
        if (location.pathname === `/properties/${property._id}`) {
            window.history.pushState({}, '', '/');
        }
    };

    return (
        <>
            <Card 
                onClick={handleClick}
                sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.02)'
                    }
                }}
            >
                <CardMedia
                    component="img"
                    height="200"
                    image={property.images?.[0]?.url || '/placeholder.jpg'}
                    alt={`${property.building.address.street} Unit ${property.unitNumber}`}
                />
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {property.building.address.street} - Unit {property.unitNumber}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                        ${property.price.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {property.bedrooms} BR | {property.bathrooms} Bath
                        {property.squareFootage > 0 && ` | ${property.squareFootage} sq ft`}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {property.building.address.neighborhood}, {property.building.address.borough}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {property.features?.slice(0, 3).map(feature => (
                            <Chip
                                key={feature.name}
                                label={feature.name}
                                size="small"
                                sx={{ mr: 0.5 }}
                            />
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {modalOpen && (
                <PropertyDetail
                    isModal={true}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default PropertyCard; 