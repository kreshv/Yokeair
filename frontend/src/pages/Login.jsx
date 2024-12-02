import { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert 
} from '@mui/material';
import { login } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const fromShowcasing = location.state?.fromShowcasing;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await login(formData);
      const { token, user } = response.data;
      authLogin(token);
      
      if (fromShowcasing) {
        navigate('/property-listing');
      } else {
        navigate(user.role === 'broker' ? '/dashboard' : '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
      console.error('Login error:', err);
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
            p: 5,
            borderRadius: '25px',
            background: 'linear-gradient(145deg, rgba(245, 241, 237, 0.8), rgba(236, 229, 221, 0.7))',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(211, 211, 211, 0.3)',
            position: 'relative'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: '#00008B',
              fontWeight: 500,
              textAlign: 'center',
              mb: 4
            }}
          >
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!error}
              variant="outlined"
              required
              autoComplete="email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!error}
              variant="outlined"
              required
              autoComplete="current-password"
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
                borderRadius: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              Login
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                '& a': {
                  color: '#4169E1',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
            >
              Don't have an account yet?{' '}
              <RouterLink to="/register">Register here!</RouterLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 