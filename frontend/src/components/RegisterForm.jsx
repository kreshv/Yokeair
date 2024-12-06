import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, LinearProgress } from '@mui/material';

const PASSWORD_REQUIREMENTS = {
    minLength: 12,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minPasswordStrength: 3
};

const calculatePasswordStrength = (password, userInfo = {}) => {
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

    // Prevent common patterns and personal info (subtract points)
    const personalInfoPatterns = [
        userInfo.firstName?.toLowerCase(),
        userInfo.lastName?.toLowerCase(),
        userInfo.email?.split('@')[0].toLowerCase(),
        userInfo.phone
    ].filter(Boolean);

    personalInfoPatterns.forEach(pattern => {
        if (password.toLowerCase().includes(pattern)) {
            score = Math.max(0, score - 1);
        }
    });

    // Common weak passwords check
    const commonPasswords = [
        'password', '123456', 'qwerty', 'admin', 
        userInfo.firstName, userInfo.lastName
    ];

    if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
        score = Math.max(0, score - 2);
    }

    return score;
};

const validatePassword = (password, userInfo = {}) => {
    const errors = [];

    // Check password length
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }

    if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
        errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
    }

    // Check uppercase
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Check lowercase
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Check numbers
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Check special characters
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Strength check
    const passwordStrength = calculatePasswordStrength(password, userInfo);

    if (passwordStrength < PASSWORD_REQUIREMENTS.minPasswordStrength) {
        errors.push('Password is too weak. Please use a more complex password.');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: passwordStrength
    };
};

const PasswordStrengthIndicator = ({ strength }) => {
    const getColor = () => {
        if (strength <= 1) return 'error';
        if (strength <= 2) return 'warning';
        if (strength <= 3) return 'primary';
        return 'success';
    };

    return (
        <LinearProgress 
            variant="determinate" 
            value={(strength / 7) * 100} 
            color={getColor()} 
            sx={{ mt: 1, mb: 1 }}
        />
    );
};

const RegisterForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate password on change
        if (name === 'password') {
            setPasswordTouched(true);
            const validation = validatePassword(value, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone
            });
            setPasswordErrors(validation.errors);
            setPasswordStrength(validation.strength);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Final validation before submission
        const passwordValidation = validatePassword(formData.password, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
        });

        if (!passwordValidation.isValid) {
            setPasswordErrors(passwordValidation.errors);
            return;
        }

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            setPasswordErrors(['Passwords do not match']);
            return;
        }

        // Remove confirmPassword before sending to backend
        const { confirmPassword, ...submitData } = formData;
        onSubmit(submitData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {/* Existing form fields */}
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                error={passwordTouched && passwordErrors.length > 0}
                helperText={passwordTouched ? 'Password strength' : ''}
            />
            {passwordTouched && (
                <>
                    <PasswordStrengthIndicator strength={passwordStrength} />
                    {passwordErrors.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            {passwordErrors.map((error, index) => (
                                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                                    {error}
                                </Alert>
                            ))}
                        </Box>
                    )}
                </>
            )}
            {/* Confirm password field */}
            <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
            />
            {/* Rest of the form */}
        </Box>
    );
};

export default RegisterForm; 