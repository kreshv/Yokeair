import { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { requestPasswordReset } from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            await requestPasswordReset(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100%',
                background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/design2.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                overflowY: 'auto',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={5}
                    sx={{
                        p: 4,
                        mt: 12,
                        borderRadius: '25px',
                        width: '500px',
                        margin: '0 auto',
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
                    <Typography
                        variant="h5"
                        component="h1"
                        gutterBottom
                        sx={{
                            color: '#00008B',
                            fontWeight: 500,
                            textAlign: 'center',
                            mb: 4
                        }}
                    >
                        Reset Password
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success ? (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Password reset instructions have been sent to your email.
                        </Alert>
                    ) : (
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(10px)'
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    color: '#000',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 400,
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        transform: 'translateY(-4px)',
                                        color: '#00008B',
                                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                                    }
                                }}
                            >
                                Send Reset Link
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPassword; 