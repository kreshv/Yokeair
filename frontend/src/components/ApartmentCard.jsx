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
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  BedOutlined, 
  BathtubOutlined, 
  SquareFootOutlined,
  LocationOnOutlined 
} from '@mui/icons-material';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);
};

const ApartmentCard = ({ apartment }) => {
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

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        borderRadius: '20px',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea component={RouterLink} to={`/apartments/${_id}`}>
        {images?.[0] ? (
          <CardMedia
            component="img"
            height="200"
            image={images[0]}
            alt={`${bedrooms} bedroom apartment in ${neighborhood}`}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Skeleton variant="rectangular" height={200} />
        )}

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
              {building?.address?.street}, {neighborhood}, {borough}
            </Typography>
          </Box>

          {features?.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {features.slice(0, 3).map((feature) => (
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
              {features.length > 3 && (
                <Chip
                  label={`+${features.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '& .MuiChip-label': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ApartmentCard; 