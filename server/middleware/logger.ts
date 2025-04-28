import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Log all API requests
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request info
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log response info when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

// Log access to specific resources
export const logAccess = (resourceType: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Store original end method
      const originalEnd = res.end;
      
      // Override end method to log after response
      res.end = function (chunk?: any, encoding?: any, callback?: any) {
        // Only log successful responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const userId = req.user?.id;
          const resourceId = req.params.id || '';
          
          // Create audit log entry after response is sent
          createAuditLog(req, {
            resourceType,
            action,
            resourceId,
            description: `User ID ${userId} performed ${action} on ${resourceType} ${resourceId}`
          }).catch(err => {
            console.error('Failed to create audit log:', err);
          });
        }
        
        // Call original end method
        return originalEnd.call(this, chunk, encoding, callback);
      };
    } catch (error) {
      console.error('Error in logAccess middleware:', error);
    }
    
    next();
  };
};

// Create an audit log entry
export const createAuditLog = async (req: Request, logData: {
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
}) => {
  try {
    const userId = req.user?.id || 0;
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    
    await storage.createAuditLog({
      userId,
      timestamp: new Date(),
      action: logData.action,
      resourceType: logData.resourceType,
      resourceId: logData.resourceId,
      ipAddress,
      userAgent,
      details: JSON.stringify({
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
      }),
      description: logData.description
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};