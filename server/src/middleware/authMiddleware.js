import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/auth/userModel.js';

export const protect = asyncHandler(async (req, res, next) => {
  try {
    // Check if token exists in cookies
    const token = req.cookies.token;

    if (!token) {
      // 401 Unauthorized
      return res.status(401).json({ message: 'Du musst angemeldet sein' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token, excluding password
    const user = await User.findById(decoded.id).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'Nutzer nicht gefunden' });
    }

    // Set user details in req object
    req.user = user;

    next();
  } catch (error) {
    // 401 Unauthorized
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Du musst angemeldet sein' });
  }
});

// Admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    // If user is admin, continue
    next();
  } else {
    // If not admin, send 403 Forbidden
    res.status(403).json({ message: 'Nicht berechtigt' });
  }
});

// Creator middleware
export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'creator' || req.user.role === 'admin')) {
    // If user is creator or admin, continue
    next();
  } else {
    // If not creator or admin, send 403 Forbidden
    res.status(403).json({ message: 'Nicht berechtigt' });
  }
});

// Verified middleware
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.verified) {
    // If user is verified, continue
    next();
  } else {
    // If not verified, send 403 Forbidden
    res.status(403).json({ message: 'Bitte bestätige deine E-Mail Adresse' });
  }
});