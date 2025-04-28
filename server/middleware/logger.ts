import { Request, Response, NextFunction } from 'express';

// Simple request logger
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

// Access logging middleware for audit trail
export const logAccess = (resourceType: string, actionType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // In a real app, we would log this to a database or audit log service
    console.log(`${new Date().toISOString()} - ACCESS LOG: User ${req.user?.id || 'anonymous'} ${actionType} ${resourceType} ${req.params.id || ''}`);
    next();
  };
};

// Audit log utility function
export const createAuditLog = async (userId: number, action: string, resourceType: string, resourceId?: number, details?: any) => {
  // In a real app, we would store this in a database
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - AUDIT LOG: User ${userId} ${action} ${resourceType} ${resourceId || ''} ${details ? JSON.stringify(details) : ''}`);
  
  // Return a mock audit log record
  return {
    id: Math.floor(Math.random() * 10000),
    userId,
    action,
    resourceType,
    resourceId: resourceId || null,
    details: details || null,
    createdAt: timestamp
  };
};