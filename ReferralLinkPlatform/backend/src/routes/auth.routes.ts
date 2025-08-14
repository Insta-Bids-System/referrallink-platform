import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = Router();

// Fixed UUID for test user - this will be consistent across sessions
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// Mock user data for testing
const mockUser = {
  id: TEST_USER_ID,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password123' // In production, this would be hashed
};

// Helper function to ensure test user exists in Supabase
async function ensureTestUserExists() {
  try {
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', TEST_USER_ID)
      .single();
    
    if (!existingUser) {
      console.log('Creating test user in Supabase...');
      const passwordHash = await bcrypt.hash(mockUser.password, 10);
      
      // Create the test user
      const { error } = await supabaseAdmin
        .from('users')
        .insert({
          id: TEST_USER_ID,
          email: mockUser.email,
          password_hash: passwordHash,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
          is_active: true,
          is_verified: true,
          role: 'user'
        });
      
      if (error) {
        console.error('Error creating test user:', error);
      } else {
        console.log('Test user created successfully');
      }
    } else {
      console.log('Test user already exists');
    }
  } catch (error) {
    console.error('Error ensuring test user exists:', error);
  }
}

// Register endpoint
router.post('/register', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }
    
    // Generate a proper UUID v4 for the user
    const userId = crypto.randomUUID();
    
    // Create user in Supabase
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const { error } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          is_active: true,
          is_verified: false,
          role: 'user'
        });
      
      if (error) {
        console.error('Error creating user in Supabase:', error);
        if (error.code === '23505') { // Duplicate entry
          return res.status(409).json({ error: 'User already exists' });
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    // Create JWT token with consistent secret
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    console.log('Signing token with secret:', jwtSecret.substring(0, 10) + '...');
    const token = jwt.sign(
      { userId, email },
      jwtSecret,
      { expiresIn: '7d' }
    );
    console.log('Token created for user:', userId);
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        firstName,
        lastName
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Mock authentication
    if (email === mockUser.email && password === mockUser.password) {
      // Ensure test user exists in Supabase
      await ensureTestUserExists();
      
      // Create JWT token with consistent secret
      const jwtSecret = process.env.JWT_SECRET || 'default-secret';
      console.log('Login - Signing token with secret:', jwtSecret.substring(0, 10) + '...');
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        jwtSecret,
        { expiresIn: '7d' }
      );
      console.log('Login token created for user:', mockUser.id);
      
      return res.json({
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName
        },
        token
      });
    } else {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed' 
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }
    
    // Mock token refresh
    const newToken = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    return res.json({
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ 
      error: 'Token refresh failed' 
    });
  }
});

// Logout endpoint
router.post('/logout', (_req: Request, res: Response) => {
  // In a real app, you might invalidate the token here
  res.json({ 
    message: 'Logged out successfully' 
  });
});

// Get current user
router.get('/me', (_req: Request, res: Response) => {
  // This would normally check the JWT token
  res.json({
    user: {
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName
    }
  });
});

// Check if test user exists (for debugging)
router.get('/check-test-user', async (_req: Request, res: Response) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', TEST_USER_ID)
      .single();
    
    if (error || !user) {
      return res.json({ 
        exists: false, 
        message: 'Test user does not exist',
        userId: TEST_USER_ID 
      });
    }
    
    res.json({ 
      exists: true, 
      message: 'Test user exists',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check user' });
  }
});

export default router;