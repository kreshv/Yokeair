import { Box, Typography, Paper } from '@mui/material';
import { Email, Phone } from '@mui/icons-material';

const BrokerageCard = ({ brokerage, onClick }) => (
    <Paper
        onClick={onClick}
        sx={{
            p: 3,
            borderRadius: '15px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
        }}
    >
        <Typography variant="h6" gutterBottom>
            {brokerage.firstName} {brokerage.lastName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Email sx={{ mr: 1, fontSize: '0.9rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
                {brokerage.email}
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Phone sx={{ mr: 1, fontSize: '0.9rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
                {brokerage.phone}
            </Typography>
        </Box>
    </Paper>
);

export default BrokerageCard; 