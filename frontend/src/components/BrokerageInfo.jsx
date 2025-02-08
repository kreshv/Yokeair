import { Box, Typography, Avatar } from '@mui/material';
import { Email, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BrokerageInfo = ({ brokerage }) => {
    const navigate = useNavigate();
    if (!brokerage) return null;
    return (
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
                    '& img': { objectFit: 'cover' }
                }}
            />
            <Box>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: '#00008B', mb: 1, cursor: 'pointer' }}
                    onClick={() => navigate(`/broker/${brokerage._id}`)}
                >
                    {brokerage.firstName} {brokerage.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {brokerage.email}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {brokerage.phone}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default BrokerageInfo; 