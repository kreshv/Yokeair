import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Alert,
    Button,
    CircularProgress
} from '@mui/material';
import { verifyEmail, resendVerificationEmail } from '../utils/api';

const EmailVerification = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [error, setError] = useState('');
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            verifyEmailToken();
        }
    }, [token]);

    const verifyEmailToken = async () => {
        try {
            await verifyEmail(token);
            setStatus('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Email verification failed');
        }
    };

    const handleResendVerification = async () => {
        try {
            await resendVerificationEmail();
            setResendSuccess(true);
            setTimeout(() => {
                setResendSuccess(false);
            }, 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification email');
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
                        Email Verification
                    </Typography>

                    {status === 'verifying' && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {status === 'success' && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Email verified successfully! Redirecting to login...
                        </Alert>
                    )}

                    {status === 'error' && (
                        <>
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Button
                                    onClick={handleResendVerification}
                                    variant="contained"
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        color: '#000',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        py: 1.5,
                                        px: 4,
                                        fontSize: '0.9rem',
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
                                    Resend Verification Email
                                </Button>
                            </Box>
                        </>
                    )}

                    {resendSuccess && (
                        <Alert severity="success" sx={{ mt: 3 }}>
                            Verification email has been resent. Please check your inbox.
                        </Alert>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default EmailVerification; 