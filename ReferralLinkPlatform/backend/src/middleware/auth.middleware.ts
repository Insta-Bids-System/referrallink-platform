import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: any;
  body: any;
  params: any;
  query: any;
  headers: any;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'None');

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Use the same secret that was used to sign the token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    console.log('Using JWT secret:', jwtSecret.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('Token decoded successfully, userId:', decoded.userId);
    
    // For now, skip database lookup and use decoded token data
    // In production, you'd want to verify the user exists in the database
    const user = {
      id: decoded.userId,
      email: decoded.email,
      isActive: true,
      userId: decoded.userId
    };

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error details:', error.message);
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}