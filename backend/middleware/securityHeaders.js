module.exports = (req, res, next) => {
  // Only apply strict security headers in production
  if (process.env.NODE_ENV === 'production') {
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self' http://localhost:5173 http://127.0.0.1:5173; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';",
      'X-Permitted-Cross-Domain-Policies': 'none'
    });
  } else {
    // Development environment - only set essential security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': req.headers.origin || 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin'
    });
  }
  next();
}; 