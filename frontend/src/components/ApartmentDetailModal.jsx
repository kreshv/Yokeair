import { 
    Dialog, 
    DialogContent, 
    IconButton, 
    Box, 
    Typography,
    Grid,
    Chip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Close as CloseIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    BedOutlined,
    BathtubOutlined,
    SquareFootOutlined,
    LocationOnOutlined
} from '@mui/icons-material';
import { useState } from 'react';

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(price);
};

const ApartmentDetailModal = ({ open, onClose, apartment }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === apartment.images.length - 1 ? 0 : prev + 1
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? apartment.images.length - 1 : prev - 1
        );
    };

    if (!apartment) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    width: '75%',
                    height: '85vh',
                    maxWidth: 'none',
                    borderRadius: '20px',
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                    m: 'auto',
                    overflow: 'auto'
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 1,
                    '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.6)'
                    }
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ position: 'relative' }}>
                    {/* Image Carousel */}
                    <Box
                        sx={{
                            height: '50vh',
                            position: 'relative',
                            bgcolor: 'grey.100'
                        }}
                    >
                        {apartment.images?.length > 0 ? (
                            <Box
                                component="img"
                                src={apartment.images[currentImageIndex]?.url || apartment.images[currentImageIndex]}
                                alt={`Apartment ${currentImageIndex + 1}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography color="text.secondary">
                                    No images available
                                </Typography>
                            </Box>
                        )}

                        {apartment.images?.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrevImage}
                                    sx={{
                                        position: 'absolute',
                                        left: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                    }}
                                >
                                    <NavigateBeforeIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{
                                        position: 'absolute',
                                        right: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                    }}
                                >
                                    <NavigateNextIcon />
                                </IconButton>
                            </>
                        )}
                    </Box>

                    {/* Apartment Details */}
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                            {formatPrice(apartment.price)}/month
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOnOutlined sx={{ mr: 1 }} />
                            <Typography>
                                {apartment.building?.address?.street} #{apartment.unitNumber} in {apartment.neighborhood}, {apartment.borough}
                            </Typography>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 3 }}>
                            <Grid item xs={2.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BedOutlined sx={{ mr: 1 }} />
                                    <Typography>
                                        {apartment.bedrooms === 1 ? '1 bedroom' : `${apartment.bedrooms} bedrooms`}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={2.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BathtubOutlined sx={{ mr: 1 }} />
                                    <Typography>
                                        {apartment.bathrooms === 1 ? '1 bathroom' : `${apartment.bathrooms} bathrooms`}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <SquareFootOutlined sx={{ mr: 1 }} />
                                    <Typography>{apartment.squareFootage} ft²</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Add Building Amenities Section */}
                        {apartment.building?.amenities?.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#00008B' }}>
                                    Building Amenities
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {apartment.building.amenities.map((amenity) => (
                                        <Chip
                                            key={amenity._id}
                                            label={amenity.name}
                                            variant="outlined"
                                            size="medium"
                                            sx={{ 
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                borderRadius: '15px'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Unit Features Section */}
                        {apartment.features?.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#00008B' }}>
                                    Unit Features
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {apartment.features.map((feature) => (
                                        <Chip
                                            key={feature._id}
                                            label={feature.name}
                                            variant="outlined"
                                            size="medium"
                                            sx={{ 
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                borderRadius: '15px'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ApartmentDetailModal; 
