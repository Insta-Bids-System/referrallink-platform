import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Mock user data for testing
const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password123' // In production, this would be hashed
};

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
    
    // Create JWT token
    const token = jwt.sign(
      { userId: '1', email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: '1',
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
      // Create JWT token
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );
      
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

export default router;