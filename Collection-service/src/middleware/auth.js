
const jwt = require('jsonwebtoken');

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    //const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
   // const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Add user info to request object
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminOnly
};
