import { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { updateUserProfile } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await updateUserProfile(formData);
            updateUser(response.data);
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

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
                        My Profile
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                            type="email"
                        />
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            variant="outlined"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                bgcolor: 'rgba(0, 0, 139, 0.8)',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(0, 0, 139, 0.9)',
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Profile; 