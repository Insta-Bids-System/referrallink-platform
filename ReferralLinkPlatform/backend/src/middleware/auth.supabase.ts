import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

/**
 * Middleware to authenticate requests using Supabase Auth
 */
export const authenticateSupabase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get full user profile from database
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      res.status(401).json({ error: 'User profile not found' });
      return;
    }

    // Attach user to request
    req.user = userProfile;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (resourceIdParam: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const resourceId = req.params[resourceIdParam];
      
      // Check if user owns the referral link
      const { data: link, error } = await supabaseAdmin
        .from('referral_links')
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (error || !link) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      if (link.user_id !== req.userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without user
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Try to verify token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (!error && user) {
      // Get full user profile
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        req.user = userProfile;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Continue without user on error
    next();
  }
};