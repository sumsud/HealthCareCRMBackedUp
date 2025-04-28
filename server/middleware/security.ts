import { Request, Response, NextFunction } from 'express';

// HIPAA Compliance Middleware
export const hipaaCompliance = (req: Request, res: Response, next: NextFunction) => {
  // Add HIPAA compliance headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Add HIPAA compliant Cache-Control
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
};

// Secure Cookies Middleware
export const secureCookies = (req: Request, res: Response, next: NextFunction) => {
  // Override res.cookie to always use secure cookies
  const originalCookie = res.cookie;
  res.cookie = function(name: string, value: string, options: any = {}) {
    const secureOptions = {
      ...options,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    
    return originalCookie.call(this, name, value, secureOptions);
  };
  
  next();
};

// Content Security Policy Middleware
export const contentSecurityPolicy = (req: Request, res: Response, next: NextFunction) => {
  // Check for development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Define CSP directives with looser restrictions for development mode
  const cspDirectives = [
    "default-src 'self'",
    // Allow unsafe-inline and unsafe-eval for dev mode with Vite/React hot module replacement
    isDevelopment 
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://replit.com"
      : "script-src 'self' https://js.stripe.com", 
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://res.cloudinary.com",
    // Allow websocket connections for HMR in development
    isDevelopment
      ? "connect-src 'self' https://api.stripe.com https://api.openai.com ws://localhost:* wss://localhost:* ws://0.0.0.0:* wss://0.0.0.0:*" 
      : "connect-src 'self' https://api.stripe.com https://api.openai.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'"
  ].join('; ');
  
  // Set CSP header
  res.setHeader('Content-Security-Policy', cspDirectives);
  
  next();
};