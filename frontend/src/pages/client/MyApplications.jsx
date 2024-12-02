import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { getUserApplications } from '../../utils/api';

const ApplicationCard = ({ application }) => (
    <Paper
        sx={{
            p: 3,
            borderRadius: '15px',
            background: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
        }}
    >
        <Typography variant="h6">
            {application.property.building.address.street} - Unit {application.property.unitNumber}
        </Typography>
        <Typography color="textSecondary">
            Submitted on: {new Date(application.createdAt).toLocaleDateString()}
        </Typography>
        <Box sx={{ mt: 2 }}>
            <Chip
                label={application.status.toUpperCase()}
                color={
                    application.status === 'pending' ? 'warning' :
                    application.status === 'approved' ? 'success' :
                    'error'
                }
                sx={{ mt: 1 }}
            />
        </Box>
    </Paper>
);

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await getUserApplications();
                setApplications(response.data);
            } catch (err) {
                setError('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design4.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                py: 4
            }}
        >
            <Container>
                <Paper
                    sx={{
                        p: 4,
                        mt: 12,
                        borderRadius: '25px',
                        background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.9), rgba(236, 229, 221, 0.8))',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Typography variant="h5" sx={{ mb: 4, color: '#00008B' }}>
                        My Applications
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {applications.map((application) => (
                            <Grid item key={application._id} xs={12} md={6}>
                                <ApplicationCard application={application} />
                            </Grid>
                        ))}
                        {applications.length === 0 && (
                            <Grid item xs={12}>
                                <Typography textAlign="center" color="textSecondary">
                                    No applications found
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default MyApplications; 