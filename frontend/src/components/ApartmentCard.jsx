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
  LocationOnOutlined
} from '@mui/icons-material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ApartmentDetailModal from './ApartmentDetailModal';
import { saveListing, removeSavedListing, getSavedListings } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from './Snackbar';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

const ApartmentCard = ({ apartment, isSaved: initialSaved = false, showSaveButton = true }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saveError, setSaveError] = useState('');
  const { user } = useAuth();
  const hasMultipleImages = apartment.images?.length > 1;
  const { showSnackbar } = useSnackbar();

  // Check if apartment is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user) {
        try {
          const response = await getSavedListings();
          const savedListings = response.data;
          const isListingSaved = savedListings.some(listing => listing._id === apartment._id);
          setIsSaved(isListingSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
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
      navigate('/register', { 
        state: { 
          returnTo: window.location.pathname,
          fromSave: true 
        }
      });
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
    _id,
    images,
    price,
    bedrooms,
    bathrooms,
    squareFootage,
    features,
    status,
    building,
    neighborhood,
    borough
  } = apartment;

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
          transition: 'transform 0.2s ease-in-out',
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => setModalOpen(true)}
      >
        <CardActionArea>
          <Box sx={{ position: 'relative' }}>
            {images?.length > 0 ? (
              <>
                <CardMedia
                  component="img"
                  height="200"
                  image={imageUrl}
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
                        right: 8,
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
            {(!user || user.role === 'client') && (
              <IconButton
                onClick={handleSaveClick}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                }}
              >
                {isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
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

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BedOutlined fontSize="small" />
                <Typography variant="body2">{bedrooms === 0 ? 'Studio' : `${bedrooms} bed`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BathtubOutlined fontSize="small" />
                <Typography variant="body2">{bathrooms} bath</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SquareFootOutlined fontSize="small" />
                <Typography variant="body2">{squareFootage} ft²</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 2 }}>
              <LocationOnOutlined fontSize="small" sx={{ mt: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                {building?.address?.street}, {borough}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
              {apartment.building?.amenities?.length > 0 ? (
                apartment.building.amenities.map((amenity) => (
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
                ))
              ) : apartment.features?.length > 0 ? (
                apartment.features.map((feature) => (
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
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No amenities or features available
                </Typography>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>

      <ApartmentDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        apartment={apartment}
      />
    </>
  );
};

export default ApartmentCard; 