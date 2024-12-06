import { useState, useMemo, useCallback } from 'react';
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
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  IconButton
} from '@mui/material';
import { register, checkEmailAvailability } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { createProperty } from '../utils/api';
import { Link as RouterLink } from 'react-router-dom';
import { saveListing } from '../utils/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const PASSWORD_REQUIREMENTS = {
    minLength: 12,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minPasswordStrength: 3
};

const calculatePasswordStrength = (password) => {
    let score = 0;

    // Length check (0-2 points)
    if (password.length >= PASSWORD_REQUIREMENTS.minLength) score += 2;
    else if (password.length >= 8) score += 1;

    // Complexity checks (0-3 points)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;

    return score;
};

const validatePassword = (password) => {
    const errors = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }

    if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
        errors.push(`Not more than ${PASSWORD_REQUIREMENTS.maxLength} characters`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Contains uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Contains lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Contains number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Contains special character');
    }

    const passwordStrength = calculatePasswordStrength(password);

    return {
        isValid: errors.length === 0,
        errors,
        strength: passwordStrength
    };
};

const PasswordRequirementsList = ({ password, anchorEl, handleClose }) => {
  const requirements = useMemo(() => [
    {
      check: password.length >= PASSWORD_REQUIREMENTS.minLength,
      label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
      info: 'Longer passwords are more secure'
    },
    {
      check: /[A-Z]/.test(password),
      label: 'Contains uppercase letter',
      info: 'e.g., A, B, C...'
    },
    {
      check: /[a-z]/.test(password),
      label: 'Contains lowercase letter',
      info: 'e.g., a, b, c...'
    },
    {
      check: /[0-9]/.test(password),
      label: 'Contains number',
      info: 'e.g., 1, 2, 3...'
    },
    {
      check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      label: 'Contains special character',
      info: 'e.g., @, #, $, !'
    }
  ], [password]);

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 300,
          borderRadius: 2,
          boxShadow: 3,
          p: 1
        }
      }}
    >
      <List dense sx={{ 
        bgcolor: 'background.paper',
        '& .MuiListItem-root': {
          padding: '2px 16px'
        }
      }}>
        {requirements.map((req, index) => (
          <ListItem key={index}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              {req.check ? (
                <CheckCircleOutlineIcon color="success" />
              ) : (
                <ErrorOutlineIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body2" color={req.check ? 'success.main' : 'error.main'}>
                  {req.label}
                </Typography>
              }
            />
            <InfoOutlinedIcon 
              color="action" 
              sx={{ 
                fontSize: 16,
                ml: 1,
                cursor: 'help',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
              titleAccess={req.info}
            />
          </ListItem>
        ))}
      </List>
    </Popover>
  );
};

const PasswordStrengthIndicator = ({ strength }) => {
  const getColor = useCallback(() => {
    if (strength <= 1) return 'error';
    if (strength <= 2) return 'warning';
    if (strength <= 3) return 'primary';
    return 'success';
  }, [strength]);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={(strength / 7) * 100} 
        color={getColor()} 
        sx={{
          width: '50%',
          height: 4,
          borderRadius: 2,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2
          }
        }}
      />
    </Box>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const propertyData = location.state?.propertyData;
  const fromShowcasing = location.state?.fromShowcasing;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isBroker: false
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordAnchorEl, setPasswordAnchorEl] = useState(null);
  const [passwordHelpAnchor, setPasswordHelpAnchor] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 11 digits
      const limitedDigits = digitsOnly.slice(0, 11);
      
      // Format phone number
      let formattedPhone = '';
      if (limitedDigits.length <= 10) {
        // 10 or fewer digits
        formattedPhone = limitedDigits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      } else if (limitedDigits.length === 11) {
        // 11 digits
        formattedPhone = limitedDigits.replace(/1?(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
      return;
    }
    
    // Existing change handling for other fields
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isBroker' ? checked : value
    }));

    // Existing password strength check
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
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

  const handlePasswordFocus = useCallback((event) => {
    setPasswordAnchorEl(event.currentTarget);
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setPasswordAnchorEl(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone number validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setError('Please enter a valid 10 or 11-digit phone number');
      return;
    }

    if (phoneDigits.length === 10 && phoneDigits[0] === '1') {
      setError('10-digit phone number cannot start with 1');
      return;
    }

    if (phoneDigits.length === 11 && phoneDigits[0] !== '1') {
      setError('11-digit phone number must start with 1');
      return;
    }

    if (emailError) {
      setError('Please use a different email address');
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);

    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      setError('Please fix the password validation errors');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        phone: phoneDigits, // Send only digits to backend
        password: formData.password,
        role: formData.isBroker ? 'broker' : 'client'
      };

      const response = await register(userData);
      login(response.data.token);

      if (!formData.isBroker && location.state?.fromSave) {
        const returnTo = location.state?.returnTo;
        const listingId = returnTo?.split('/').pop();
        
        if (listingId) {
          try {
            await saveListing(listingId);
          } catch (saveError) {
            console.error('Failed to save listing:', saveError);
          }
        }
        
        navigate('/');
      } else if (formData.isBroker && fromShowcasing) {
        navigate('/property-listing');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handlePasswordHelpClick = (event) => {
    event.preventDefault();
    setPasswordHelpAnchor(event.currentTarget);
  };

  const handlePasswordHelpClose = () => {
    setPasswordHelpAnchor(null);
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
            p: 4,
            mt: 12,
            borderRadius: '25px',
            width: '600px',
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
              mb: 4, 
              color: '#00008B',
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Create Your Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              sx={textFieldStyle}
              placeholder="(123) 456-7890"
            />

            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      edge="end"
                      onClick={handlePasswordHelpClick}
                      size="small"
                      sx={{ mr: 0.5 }}
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  )
                }}
                sx={textFieldStyle}
              />
              {formData.password && (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength / 5) * 100}
                    sx={{
                      width: '50%',
                      height: 3,
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        bgcolor: passwordStrength <= 2 ? 'error.main' : 
                                passwordStrength <= 3 ? 'warning.main' : 
                                passwordStrength <= 4 ? 'info.main' : 'success.main'
                      }
                    }}
                  />
                </Box>
              )}
            </Box>

            <Popover
              open={Boolean(passwordHelpAnchor)}
              anchorEl={passwordHelpAnchor}
              onClose={handlePasswordHelpClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  overflow: 'hidden'
                }
              }}
            >
              <Box sx={{ p: 2, maxWidth: 300 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Password must have at least:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>12 characters</li>
                  <li>Uppercase letter (A-Z)</li>
                  <li>A number (0-9)</li>
                  <li>Special character (!@#$...)</li>
                </Typography>
              </Box>
            </Popover>

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={formData.confirmPassword && formData.password !== formData.confirmPassword}
              helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
              sx={textFieldStyle}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="isBroker"
                  checked={formData.isBroker}
                  onChange={handleChange}
                  sx={{
                    color: '#00008B',
                    '&.Mui-checked': {
                      color: '#00008B',
                    },
                  }}
                />
              }
              label="This is a Brokerage Account"
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
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-4px)',
                  color: '#00008B',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              Register
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
              Already registered?{' '}
              <RouterLink to="/login" state={{ fromShowcasing: fromShowcasing }}>
                Login here!
              </RouterLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 