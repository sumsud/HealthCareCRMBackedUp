import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add user property to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to authenticate JWT tokens
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - No token provided' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized - Invalid token' 
        });
      }
      
      // Get user from storage
      const user = await storage.getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized - User not found' 
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized - Account is inactive' 
        });
      }
      
      // Add user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden - Requires role: ${roles.join(' or ')}` 
      });
    }
    
    next();
  };
};