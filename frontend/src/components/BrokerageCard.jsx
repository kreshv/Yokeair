import { Box, Typography, Paper, Avatar } from '@mui/material';
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
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
                src={brokerage.profilePicture}
                alt={`${brokerage.firstName} ${brokerage.lastName}`}
                sx={{
                    width: 80,
                    height: 80,
                    border: '2px solid rgba(0, 0, 139, 0.1)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'rgba(0, 0, 139, 0.05)',
                    '& img': {
                        objectFit: 'cover'
                    }
                }}
            />
            <Box sx={{ flex: 1 }}>
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 500,
                        color: '#00008B',
                        mb: 1
                    }}
                >
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
            </Box>
        </Box>
    </Paper>
);

export default BrokerageCard; 