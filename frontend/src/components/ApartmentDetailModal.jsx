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
    LocationOnOutlined,
    Apartment as ApartmentIcon,
    Home as HomeIcon
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
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    maxHeight: '92vh',
                    width: '85%',
                    margin: 'auto',
                    bgcolor: 'background.paper',
                    '& .MuiDialog-paper': {
                        borderRadius: '20px',
                    }
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1,
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.25)'
                    }
                }}
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{ position: 'relative' }}>
                {/* Image Section - Increased to 60% of modal height */}
                <Box sx={{ 
                    height: '60vh',
                    position: 'relative',
                    bgcolor: 'grey.100'
                }}>
                    {apartment.images?.length > 0 ? (
                        <img
                            src={apartment.images[currentImageIndex]?.url}
                            alt={`Property ${currentImageIndex + 1}`}
                            style={{
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
                            <Typography color="textSecondary">
                                No image available
                            </Typography>
                        </Box>
                    )}

                    {/* Navigation Buttons - More transparent and subtle */}
                    {apartment.images?.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrevImage}
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                                    backdropFilter: 'blur(4px)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    padding: '8px',
                                }}
                            >
                                <NavigateBeforeIcon sx={{ fontSize: '1.5rem' }} />
                            </IconButton>
                            <IconButton
                                onClick={handleNextImage}
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                                    backdropFilter: 'blur(4px)',
                                    '&:hover': { 
                                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    padding: '8px',
                                }}
                            >
                                <NavigateNextIcon sx={{ fontSize: '1.5rem' }} />
                            </IconButton>
                        </>
                    )}

                    {/* Image Counter - More subtle */}
                    {apartment.images?.length > 1 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 0.5
                            }}
                        >
                            {apartment.images.map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        bgcolor: index === currentImageIndex 
                                            ? 'rgba(255, 255, 255, 0.9)'
                                            : 'rgba(255, 255, 255, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Content Section - Left aligned containers with reduced top margin */}
                <Box sx={{ 
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                }}>
                    {/* Price and basic info */}
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                            {formatPrice(apartment.price)}/month
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOnOutlined sx={{ mr: 1 }} />
                            <Typography>
                                {apartment.building?.address?.street} #{apartment.unitNumber} in {apartment.neighborhood}, {apartment.borough}
                            </Typography>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BedOutlined sx={{ mr: 1 }} />
                                    <Typography>
                                        {apartment.bedrooms === 1 ? '1 bedroom' : `${apartment.bedrooms} bedrooms`}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={2}>
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
                    </Box>

                    {/* Building Amenities Section */}
                    {apartment.building?.amenities?.length > 0 && (
                        <Box 
                            sx={{ 
                                mt: 0.5,
                                p: 3,
                                width: '70%',
                                backgroundColor: 'rgba(0, 0, 139, 0.03)',
                                borderRadius: '16px',
                                border: '1px solid rgba(0, 0, 139, 0.1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                sx={{ 
                                    color: '#00008B',
                                    fontWeight: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 2
                                }}
                            >
                                <ApartmentIcon />
                                Building Amenities
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 1.5
                            }}>
                                {apartment.building.amenities.map((amenity) => (
                                    <Chip
                                        key={amenity._id}
                                        label={amenity.name}
                                        variant="outlined"
                                        size="medium"
                                        sx={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderColor: 'rgba(0, 0, 139, 0.2)',
                                            borderRadius: '12px',
                                            px: 1,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 139, 0.05)',
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Unit Features Section */}
                    {apartment.features?.length > 0 && (
                        <Box 
                            sx={{ 
                                mt: 2,
                                p: 3,
                                width: '70%',
                                backgroundColor: 'rgba(0, 0, 139, 0.03)',
                                borderRadius: '16px',
                                border: '1px solid rgba(0, 0, 139, 0.1)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                sx={{ 
                                    color: '#00008B',
                                    fontWeight: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 2
                                }}
                            >
                                <HomeIcon />
                                Unit Features
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 1.5
                            }}>
                                {apartment.features.map((feature) => (
                                    <Chip
                                        key={feature._id}
                                        label={feature.name}
                                        variant="outlined"
                                        size="medium"
                                        sx={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderColor: 'rgba(0, 0, 139, 0.2)',
                                            borderRadius: '12px',
                                            px: 1,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 139, 0.05)',
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default ApartmentDetailModal; 
