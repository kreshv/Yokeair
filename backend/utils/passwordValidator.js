const PASSWORD_REQUIREMENTS = {
    minLength: 12,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minPasswordStrength: 3 // Custom scoring
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

module.exports = {
    validatePassword,
    PASSWORD_REQUIREMENTS,
    calculatePasswordStrength
}; 