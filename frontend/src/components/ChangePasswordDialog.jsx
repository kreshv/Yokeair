import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Typography,
    Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { changePassword, requestPasswordReset } from '../utils/api';

const ChangePasswordDialog = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            await changePassword(formData.currentPassword, formData.newPassword);
            setSuccess('Password changed successfully');
            setTimeout(() => {
                onClose();
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const handleForgotPassword = async () => {
        try {
            await requestPasswordReset(localStorage.getItem('userEmail'));
            setSuccess('Password reset email sent. Please check your inbox.');
            setTimeout(() => {
                onClose();
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', color: '#00008B' }}>
                Change Password
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Current Password"
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        helperText="Password must have at least 12 characters, one uppercase letter, one number, and one special character"
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Confirm New Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={handleForgotPassword}
                            sx={{
                                textDecoration: 'none',
                                color: '#00008B',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </Typography>
                </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        backgroundColor: 'rgba(0, 0, 139, 0.8)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 139, 0.9)'
                        }
                    }}
                >
                    Change Password
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangePasswordDialog; 