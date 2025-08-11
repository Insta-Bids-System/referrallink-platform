import { Request, Response } from 'express';
import { SupabaseUserService } from '../services/supabase/user.service';
import { supabaseAdmin } from '../config/supabase';

export class SupabaseAuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Check if user already exists
      const existingUser = await SupabaseUserService.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Create user
      const user = await SupabaseUserService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      });

      // Sign in to get session token
      const { user: authUser, token } = await SupabaseUserService.signIn(email, password);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Sign in user
      const { user, token } = await SupabaseUserService.signIn(email, password);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        res.status(401).json({ error: 'Invalid email or password' });
      } else {
        res.status(500).json({ error: error.message || 'Login failed' });
      }
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        
        // Sign out from Supabase
        await supabaseAdmin.auth.signOut();
      }

      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // Refresh session with Supabase
      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      res.json({
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');

      // Get user from token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Get full profile
      const profile = await SupabaseUserService.getUserById(user.id);

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phoneNumber: profile.phone_number,
          role: profile.role,
          isVerified: profile.is_verified,
          createdAt: profile.created_at
        }
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');

      // Get user from token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const { firstName, lastName, phoneNumber } = req.body;

      // Update profile
      const updatedUser = await SupabaseUserService.updateUser(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          phoneNumber: updatedUser.phone_number,
          role: updatedUser.role
        }
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new passwords are required' });
        return;
      }

      // Get user from token
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Verify current password
      const profile = await SupabaseUserService.getUserById(user.id);
      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Try to sign in with current password to verify it
      try {
        await SupabaseUserService.signIn(profile.email, currentPassword);
      } catch (error) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Update password
      await SupabaseUserService.updatePassword(user.id, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}