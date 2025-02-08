import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CardActionArea,
  Skeleton,
  IconButton,
} from '@mui/material';
import { 
  BedOutlined, 
  BathtubOutlined, 
  SquareFootOutlined,
  LocationOnOutlined,
  Edit as EditIcon
} from '@mui/icons-material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ApartmentDetailModal from './ApartmentDetailModal';
import { saveListing, removeSavedListing, getSavedListings } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { useNavigate, useLocation } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

const ApartmentCard = ({ apartment = {}, isSaved: initialSaved = false, showSaveButton = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saveError, setSaveError] = useState('');
  const { user } = useAuth();
  const hasMultipleImages = apartment?.images?.length > 1;
  const { showSnackbar } = useSnackbar();

  // Check if this apartment should show modal based on URL
  useEffect(() => {
    const apartmentIdFromUrl = new URLSearchParams(location.search).get('apartment');
    if (apartmentIdFromUrl === apartment._id) {
      setModalOpen(true);
    }
  }, [location.search, apartment._id]);

  const handleCardClick = () => {
    // Open modal first for immediate visual feedback
    setModalOpen(true);
    
    // Then update URL without causing a reload
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('apartment', apartment._id);
    
    // Use replace to avoid adding to history stack
    window.history.replaceState(
      null,
      '',
      `${location.pathname}?${searchParams.toString()}`
    );
  };

  const handleModalClose = () => {
    // Close modal first for immediate visual feedback
    setModalOpen(false);
    
    // Then update URL without causing a reload
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('apartment');
    
    // Use replace to avoid adding to history stack
    const newUrl = searchParams.toString() 
      ? `${location.pathname}?${searchParams.toString()}`
      : location.pathname;
    
    window.history.replaceState(
      null,
      '',
      newUrl
    );
    
    // Restore scroll position
    const scrollPosition = location.state?.scrollPosition || 0;
    window.scrollTo(0, scrollPosition);
  };

  // Determine if edit button should be shown
  const shouldShowEditButton = (() => {
    // Only show edit button if user is a broker and the listing belongs to them
    return user?.role === 'broker' && apartment?.brokerId === user?._id;
  })();

  const handleEditClick = (e) => {
    e.stopPropagation();
    // Store the current path to return to after editing
    localStorage.setItem('returnPath', location.pathname);
    // Store any existing state (like search filters)
    if (location.state) {
      localStorage.setItem('returnState', JSON.stringify(location.state));
    }
    navigate(`/edit-property/${apartment._id}`);
  };

  // Determine if save button should be shown
  const shouldShowSaveButton = (() => {
    // If showSaveButton prop is false, don't show the button
    if (!showSaveButton) return false;
    
    // If user is logged in and is a broker, don't show save button
    if (user && user.role === 'broker') return false;
    
    // Show save button for non-logged-in users and clients
    return true;
  })();

  // Check if apartment is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        // Only check saved status if user is logged in
        if (!localStorage.getItem('token')) {
          setIsSaved(false);
          return;
        }
        
        const response = await getSavedListings();
        // Check if response.data exists and is an array
        const savedListings = Array.isArray(response.data) ? response.data : [];
        setIsSaved(savedListings.some(listing => listing._id === apartment._id));
      } catch (error) {
        console.error('Error checking saved status:', error);
        // Don't show error for 404 when user is not logged in
        if (error?.response?.status !== 404) {
          console.error('Error checking saved status:', error);
        }
        setIsSaved(false);
      }
    };

    checkSavedStatus();
  }, [user, apartment._id]);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === apartment.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? apartment.images.length - 1 : prev - 1
    );
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      // Store the apartment ID they tried to save
      localStorage.setItem('pendingSave', apartment._id);
      // Store the current path to return to
      localStorage.setItem('returnPath', location.pathname);
      // Redirect to register
      navigate('/register');
      return;
    }

    try {
      if (isSaved) {
        await removeSavedListing(apartment._id);
        setIsSaved(false);
        showSnackbar('Listing removed from saved items');
      } else {
        await saveListing(apartment._id);
        setIsSaved(true);
        showSnackbar('Listing saved successfully');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        showSnackbar('This listing is already saved', 'info');
      } else {
        showSnackbar('Failed to save listing', 'error');
        console.error('Save error:', error);
      }
    }
  };

  const {
    _id = '',
    images = [],
    price = 0,
    bedrooms = 0,
    bathrooms = 0,
    squareFootage = 0,
    features = [],
    status = 'unavailable',
    building = {},
    neighborhood = '',
    borough = ''
  } = apartment || {};

  const imageUrl = images && images.length > 0 
    ? images[0].url 
    : '/no-image-available.png'; // Your fallback image

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            '& .image-overlay': {
              opacity: 1
            }
          }
        }}
        onClick={handleCardClick}
      >
        <Box sx={{ position: 'relative' }}>
          {images?.length > 0 ? (
            <>
              <CardMedia
                component="img"
                height="200"
                image={images[currentImageIndex].url}
                alt={`${bedrooms} bedroom apartment in ${neighborhood}`}
                sx={{ objectFit: 'cover' }}
              />
              {hasMultipleImages && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      opacity: 0,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      width: 30,
                      height: 30,
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.2rem',
                      },
                      '.MuiCard-root:hover &': {
                        opacity: 1
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
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      opacity: 0,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      width: 30,
                      height: 30,
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.2rem',
                      },
                      '.MuiCard-root:hover &': {
                        opacity: 1
                      }
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </>
              )}
              {shouldShowEditButton && (
                <IconButton
                  onClick={handleEditClick}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: shouldShowSaveButton ? 48 : 8,
                    backgroundColor: 'rgba(128, 128, 128, 0.7)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(128, 128, 128, 0.9)',
                      transform: 'scale(1.1)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              )}
              {shouldShowSaveButton && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveClick(e);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {isSaved ? (
                    <BookmarkIcon sx={{ color: '#4169E1' }} />
                  ) : (
                    <BookmarkBorderIcon />
                  )}
                </IconButton>
              )}
            </>
          ) : (
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200'
              }}
            >
              <Typography color="textSecondary">
                No image available
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {formatPrice(price)}/month
            </Typography>
            {status === 'available' && (
              <Chip 
                label="Available" 
                color="success" 
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Box 
            sx={{ 
                display: 'flex', 
                gap: 1, 
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
                gap: 0.5,
                whiteSpace: 'nowrap',
                minWidth: 0
            }}>
                <BedOutlined fontSize="small" />
                <Typography variant="body2" noWrap>{bedrooms === 0 ? 'Studio' : `${bedrooms} bed`}</Typography>
            </Box>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                whiteSpace: 'nowrap',
                minWidth: 0
            }}>
                <BathtubOutlined fontSize="small" />
                <Typography variant="body2" noWrap>{bathrooms} bath</Typography>
            </Box>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                whiteSpace: 'nowrap',
                minWidth: 0
            }}>
                <SquareFootOutlined fontSize="small" />
                <Typography variant="body2" noWrap>{squareFootage} ft²</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 2 }}>
            <LocationOnOutlined fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" color="text.secondary">
              {building?.address?.street}, {borough}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {(apartment.building?.amenities?.length > 0 || apartment.features?.length > 0) ? (
              <>
                {/* Building Amenities */}
                {apartment.building?.amenities?.map((amenity) => (
                  <Chip
                    key={amenity._id}
                    label={amenity.name}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      '& .MuiChip-label': {
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                ))}
                {/* Unit Features */}
                {apartment.features?.map((feature) => (
                  <Chip
                    key={feature._id}
                    label={feature.name}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      '& .MuiChip-label': {
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                ))}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No amenities or features available
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <ApartmentDetailModal
        open={modalOpen}
        onClose={handleModalClose}
        apartment={apartment}
      />
    </>
  );
};

export default ApartmentCard; 