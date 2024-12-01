import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { register, checkEmailAvailability } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { createProperty } from '../utils/api';
import { Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const propertyData = location.state?.propertyData;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    isBroker: true // Default to true since coming from property listing
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isBroker' ? checked : value
    }));
  };

  const handleEmailBlur = async (e) => {
    const email = e.target.value;
    if (email) {
      try {
        await checkEmailAvailability(email);
        setEmailError('');
      } catch (error) {
        setEmailError('This email is already registered');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (emailError) {
      setError('Please use a different email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // First register the user
      const response = await register(formData);
      
      // Get the token and user data
      const { token, user } = response.data;
      login(token);
      
      // If we have property data, create the property
      if (propertyData) {
        try {
          // Add the user ID to the property data
          const propertyResponse = await createProperty({
            ...propertyData,
            broker: user.id // Change userId to broker to match the model
          });
          
          navigate('/property-amenities', { 
            state: { 
              propertyId: propertyResponse.data._id,
              userId: user.id 
            }
          });
        } catch (propertyError) {
          console.error('Error creating property:', propertyError);
          setError('Failed to create property. Please try again.');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)'
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
            variant="h5" 
            component="h1" 
            gutterBottom
            sx={{ 
              mb: 4, 
              color: '#00008B',
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Create Your Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                sx={textFieldStyle}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                sx={textFieldStyle}
              />
            </Box>

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              error={!!emailError}
              helperText={emailError}
              required
              sx={textFieldStyle}
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              sx={textFieldStyle}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={textFieldStyle}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={textFieldStyle}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isBroker}
                  onChange={handleChange}
                  name="isBroker"
                  color="primary"
                />
              }
              label="I am a brokerage"
              sx={{ 
                color: '#00008B',
                '& .MuiCheckbox-root': {
                  color: '#00008B'
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
              Register
            </Button>
          </Box>

          {propertyData && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#00008B',
                  opacity: 0.8
                }}
              >
                Already have an account?{' '}
                <Button
                  component={RouterLink}
                  to="/login"
                  state={{ propertyData }} // Pass propertyData to login
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    color: '#4169E1',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#1E3A8A'
                    }
                  }}
                >
                  Log in here
                </Button>
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 