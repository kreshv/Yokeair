import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert 
} from '@mui/material';
import { login, createProperty } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const propertyData = location.state?.propertyData;
  
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
      
      // If we have property data, create the property
      if (propertyData) {
        try {
          console.log('Property data being sent:', {
            ...propertyData,
            broker: user.id
          });

          const propertyResponse = await createProperty({
            ...propertyData,
            broker: user.id
          });
          
          navigate('/property-amenities', { 
            state: { 
              propertyId: propertyResponse.data._id,
              userId: user.id 
            },
            replace: true
          });
        } catch (propertyError) {
          console.error('Property Error Details:', propertyError.response?.data);
          setError('Failed to create property. Please try again.');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button 
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 