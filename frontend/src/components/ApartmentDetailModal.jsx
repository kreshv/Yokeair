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
import { useState, useEffect } from 'react';

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

    // Add keyboard event handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open || !apartment?.images?.length) return;
            
            if (e.key === 'ArrowLeft') {
                handlePrevImage();
            } else if (e.key === 'ArrowRight') {
                handleNextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, apartment]);

    if (!apartment) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    overflow: 'hidden',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    height: 'auto'
                }
            }}
        >
            <DialogContent 
                sx={{ 
                    p: 0, 
                    '&::-webkit-scrollbar': { display: 'none' }, 
                    scrollbarWidth: 'none',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    {/* Image Section */}
                    <Box sx={{ 
                        height: '60vh',
                        position: 'relative',
                        bgcolor: 'grey.100',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        {apartment.images?.length > 0 ? (
                            <img
                                src={apartment.images[currentImageIndex]?.url}
                                alt={`Property ${currentImageIndex + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '20px 20px 0 0'
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

                        {/* Navigation Arrows */}
                        {apartment.images?.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrevImage}
                                    sx={{
                                        position: 'absolute',
                                        left: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        width: '36px',
                                        height: '36px',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.8)'
                                        }
                                    }}
                                >
                                    <NavigateBeforeIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        width: '36px',
                                        height: '36px',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.8)'
                                        }
                                    }}
                                >
                                    <NavigateNextIcon />
                                </IconButton>

                                {/* Image Counter */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                                        color: 'white',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '12px',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {currentImageIndex + 1} / {apartment.images.length}
                                </Box>
                            </>
                        )}

                        {/* Close Button */}
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.6)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.8)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Content Section - Removed separate scrolling */}
                    <Box sx={{ 
                        p: 3,
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

                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    gap: 3,
                                    mb: 2,
                                    flexWrap: 'nowrap',
                                    minWidth: 0,
                                    '& > *': {
                                        flex: '0 0 auto'
                                    }
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    minWidth: 0
                                }}>
                                    <BedOutlined sx={{ mr: 1 }} />
                                    <Typography noWrap>
                                        {apartment.bedrooms === 0 ? 'Studio' : apartment.bedrooms === 1 ? '1 bedroom' : `${apartment.bedrooms} bedrooms`}
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    minWidth: 0
                                }}>
                                    <BathtubOutlined sx={{ mr: 1 }} />
                                    <Typography noWrap>
                                        {apartment.bathrooms === 1 ? '1 bathroom' : `${apartment.bathrooms} bathrooms`}
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    minWidth: 0
                                }}>
                                    <SquareFootOutlined sx={{ mr: 1 }} />
                                    <Typography noWrap>{apartment.squareFootage} ft²</Typography>
                                </Box>
                            </Box>
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
            </DialogContent>
        </Dialog>
    );
};

export default ApartmentDetailModal; 
