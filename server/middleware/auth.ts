import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Define user roles type
export type UserRole = 'admin' | 'physician' | 'nurse' | 'receptionist' | 'billing';

// Add user property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT Authentication Middleware
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Get the token from cookies or Authorization header
  const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify the token
    const secret = process.env.JWT_SECRET || 'temporary-dev-secret';
    const decoded = jwt.verify(token, secret) as any;
    
    // Get user from storage
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user has required role
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    
    next();
  };
};