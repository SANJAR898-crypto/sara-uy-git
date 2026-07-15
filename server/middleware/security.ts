import { Request, Response, NextFunction } from 'express';

// Memory-based simple rate limiter to protect API endpoints
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function apiRateLimiter(windowMs: number = 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    let rateData = rateLimitCache.get(ip);
    
    if (!rateData || now > rateData.resetTime) {
      rateData = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitCache.set(ip, rateData);
      return next();
    }
    
    rateData.count++;
    if (rateData.count > maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests from this IP, please try again later.',
        retryAfterMs: rateData.resetTime - now
      });
    }
    
    next();
  };
}

/**
 * Sanitizes an object recursively to prevent XSS (strips HTML tags and script elements)
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Strip HTML tags and scripts
    return data
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }
  
  if (data !== null && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeInput(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Express middleware to sanitize body and query inputs
 */
export function sanitizeRequestMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  next();
}
