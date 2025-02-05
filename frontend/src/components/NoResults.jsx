import { Box, Typography, Button } from '@mui/material';
import { SearchOff } from '@mui/icons-material';

const NoResults = ({ onReturnHome }) => (
    <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2
    }}>
        <SearchOff sx={{ fontSize: 60, color: '#FFFFFF', opacity: 0.8 }} />
        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
            No results found
        </Typography>
        <Typography variant="body2" sx={{ color: '#FFFFFF', opacity: 0.8, textAlign: 'center', mb: 2 }}>
            Try adjusting your search criteria or explore our homepage for more options
        </Typography>
        <Button
            variant="contained"
            onClick={onReturnHome}
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                px: 4,
                py: 1,
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                }
            }}
        >
            Return Home
        </Button>
    </Box>
);

export default NoResults; 