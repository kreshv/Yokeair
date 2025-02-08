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
        // Set modal state first for immediate feedback
        setModalOpen(true);

        // Preserve existing search parameters
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('property', property._id);

        // Update URL without causing a reload
        window.history.replaceState(
            { 
                property,
                previousPath: location.pathname,
                previousSearch: location.search,
                scrollPosition: window.scrollY
            },
            '',
            `${location.pathname}?${searchParams.toString()}`
        );
    };

    const handleCloseModal = () => {
        // Close modal first for immediate feedback
        setModalOpen(false);

        // Get the previous search parameters
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('property');

        // Restore the URL without causing a reload
        const newUrl = searchParams.toString() 
            ? `${location.pathname}?${searchParams.toString()}`
            : location.pathname;

        window.history.replaceState(
            {
                scrollPosition: window.scrollY
            },
            '',
            newUrl
        );

        // Restore scroll position
        const scrollPosition = location.state?.scrollPosition || 0;
        window.scrollTo(0, scrollPosition);
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