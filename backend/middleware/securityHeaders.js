module.exports = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': [
        "default-src 'self'",
        "https://jolly-douhua-92a088.netlify.app",
        "https://yokeair.onrender.com",
        "img-src 'self' data: blob: https:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      ].join('; '),
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Access-Control-Allow-Origin': req.headers.origin || 'https://jolly-douhua-92a088.netlify.app',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
      'Access-Control-Expose-Headers': 'x-auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    });
  } else {
    // Development environment - only set essential security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': req.headers.origin || 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
      'Access-Control-Expose-Headers': 'x-auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin'
    });
  }
  next();
}; 