import { useState, useRef } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Avatar,
    Button,
    Grid,
    Divider,
    TextField,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Badge
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, updateProfilePicture } from '../../utils/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const cloudinaryRef = useRef();
    const widgetRef = useRef();

    const handleEditClick = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
        setIsEditing(true);
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async () => {
        try {
            const response = await updateUserProfile(formData);
            updateUser(response.data);
            setSuccess('Profile updated successfully');
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleProfilePictureUpload = () => {
        // Check if Cloudinary script is loaded
        if (!window.cloudinary) {
            // Dynamically load the Cloudinary script
            const script = document.createElement('script');
            script.src = 'https://upload-widget.cloudinary.com/global/all.js';
            script.async = true;
            script.onload = () => {
                initCloudinaryWidget();
            };
            script.onerror = () => {
                setError('Failed to load Cloudinary upload widget');
            };
            document.body.appendChild(script);
            return;
        }
        
        initCloudinaryWidget();

        function initCloudinaryWidget() {
            try {
                cloudinaryRef.current = window.cloudinary;
                
                // Ensure cloudinary is properly initialized
                if (!cloudinaryRef.current || typeof cloudinaryRef.current.createUploadWidget !== 'function') {
                    setError('Cloudinary upload widget is not available');
                    return;
                }

                widgetRef.current = cloudinaryRef.current.createUploadWidget(
                    {
                        cloudName: 'deywdn3g4',
                        uploadPreset: 'ml_default',
                        folder: 'yoke_profile_pictures',
                        maxFiles: 1,
                        cropping: true,
                        croppingAspectRatio: 1,
                        croppingShowDimensions: true,
                        clientAllowedFormats: ['image'],
                        maxImageFileSize: 5000000,
                        
                        // Unsigned upload configuration
                        unsigned: true,
                        
                        // Add more detailed error handling
                        showAdvancedOptions: true,
                        defaultSource: 'local',
                        sources: ['local', 'camera'],
                    },
                    (error, result) => {
                        console.log('Cloudinary upload full result:', result);
                        console.log('Cloudinary upload full error:', error);

                        // More comprehensive error handling
                        if (error) {
                            console.error('Detailed Cloudinary upload error:', error);
                            let errorMessage = 'Upload failed';
                            
                            if (error.status) {
                                errorMessage += `: ${error.status}`;
                            }
                            
                            if (error.statusText) {
                                errorMessage += ` - ${error.statusText}`;
                            }
                            
                            setError(errorMessage);
                            return;
                        }

                        if (result && result.event === 'success') {
                            const imageUrl = result.info.secure_url;
                            updateProfilePicture(imageUrl)
                                .then((updatedUser) => {
                                    updateUser(updatedUser);
                                    setSuccess('Profile picture updated successfully!');
                                })
                                .catch((err) => {
                                    console.error('Profile picture update error:', err);
                                    setError('Failed to update profile picture: ' + err.message);
                                });
                        }
                    }
                );

                // Open the widget
                widgetRef.current.open();
            } catch (err) {
                console.error('Error initializing Cloudinary widget:', err);
                setError('Failed to initialize upload widget: ' + err.message);
            }
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                py: 4
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={5}
                    sx={{
                        p: 4,
                        mt: 12,
                        borderRadius: '25px',
                        background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.9), rgba(236, 229, 221, 0.8))',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(255, 255, 255, 0.2)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(255, 255, 255, 0.3)',
                        }
                    }}
                >
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                        <Typography variant="h5" sx={{ color: '#00008B', fontWeight: 500, fontSize: '1.5rem' }}>
                            My Profile
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEditClick}
                            sx={{
                                borderRadius: '25px',
                                backgroundColor: 'rgba(0, 0, 139, 0.1)',
                                color: '#00008B',
                                textTransform: 'none',
                                px: 3,
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 139, 0.2)',
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    <IconButton
                                        onClick={handleProfilePictureUpload}
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 32,
                                            height: 32,
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                            },
                                        }}
                                    >
                                        <PhotoCamera sx={{ color: 'white', fontSize: 18 }} />
                                    </IconButton>
                                }
                            >
                                <Avatar
                                    src={user?.profilePicture || '/default-avatar.png'}
                                    alt={user?.firstName}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid rgba(255, 255, 255, 0.8)',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </Badge>
                        </Box>
                        <Box sx={{ ml: 3 }}>
                            <Typography variant="h5" sx={{ mb: 1 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5 }}>
                                {user?.role === 'broker' ? 'Broker' : 'Client'}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email Address
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {user?.email}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Phone Number
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {user?.phone || 'Not provided'}
                            </Typography>
                        </Grid>
                        {user?.role === 'broker' && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Account Type
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 1, color: '#00008B', fontWeight: 500 }}>
                                    Brokerage Account
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            </Container>

            {/* Edit Profile Dialog */}
            <Dialog 
                open={isEditing} 
                onClose={handleCancel}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '500px'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Edit Profile
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {user?.role === 'broker' && (
                            <>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    margin="normal"
                                    variant="outlined"
                                    disabled
                                    InputProps={{
                                        readOnly: true
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    margin="normal"
                                    variant="outlined"
                                    disabled
                                    InputProps={{
                                        readOnly: true
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                />
                            </>
                        )}
                        
                        {user?.role === 'client' && (
                            <>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </>
                        )}
                        
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            margin="normal"
                            variant="outlined"
                            disabled
                            InputProps={{
                                readOnly: true
                            }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    cursor: 'not-allowed'
                                }
                            }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCancel}
                        sx={{
                            color: 'text.secondary',
                            textTransform: 'none',
                            borderRadius: '20px',
                            px: 3,
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                borderColor: 'rgba(0, 0, 0, 0.35)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgba(0, 0, 139, 0.1)',
                            color: '#00008B',
                            textTransform: 'none',
                            borderRadius: '20px',
                            px: 3,
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 139, 0.2)',
                            }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile; 