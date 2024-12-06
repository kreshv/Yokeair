// Password validation rules
export const passwordRules = {
    minLength: 12,  // Increased from 10
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true
};

// Common weak passwords to prevent
const commonPasswords = [
    'Password123!',
    'Admin123!',
    'Welcome123!',
    'Qwerty123!',
    'Test123!',
    '12345678',
    'password',
    'admin'
];

// Validate password strength
export const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        errors.push('Password is required');
        return errors;
    }

    if (password.length < passwordRules.minLength) {
        errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
    }

    if (password.length > passwordRules.maxLength) {
        errors.push(`Password cannot exceed ${passwordRules.maxLength} characters`);
    }

    if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (passwordRules.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (passwordRules.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Password cannot contain three or more repeated characters in a row');
    }

    // Check against common passwords
    if (commonPasswords.includes(password)) {
        errors.push('This password is too common. Please choose a stronger password');
    }

    // Additional check: prevent keyboard patterns
    const keyboardPatterns = [
        'qwerty', 'asdfgh', 'zxcvbn', '123456', 'abcdef'
    ];
    if (keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        errors.push('Password contains a common keyboard pattern');
    }

    return errors;
}; 