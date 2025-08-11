import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Import database
import { connectDatabase } from './config/database';

// Import routers
import authRouter from './routes/auth.routes';
import referralRouter from './routes/referral.routes';
import analyticsRouter from './routes/analytics.routes';
import aiRouter from './routes/ai.routes';
import communicationRouter from './routes/communication.routes';
import adminRouter from './routes/admin.routes';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private httpServer: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true
      }
    });
    this.port = parseInt(process.env.PORT || '5000');
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration - More permissive in development
    const corsOptions = process.env.NODE_ENV === 'development' 
      ? {
          origin: true, // Allow all origins in development
          credentials: true
        }
      : {
          origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
          credentials: true
        };
    
    this.app.use(cors(corsOptions));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.app.use('/api/', limiter);
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Logging
    this.app.use(morgan('combined'));
    
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  }

  private initializeRoutes(): void {
    // Landing page - public route
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        name: 'ReferralLink Platform API',
        version: '1.0.0',
        status: 'operational',
        endpoints: {
          health: '/health',
          auth: '/api/auth',
          referrals: '/api/referrals',
          analytics: '/api/analytics',
          documentation: '/api/docs'
        },
        message: 'Welcome to ReferralLink Platform - Your AI-powered referral system'
      });
    });

    // Public routes
    this.app.use('/api/auth', authRouter);
    this.app.use('/api/referrals', referralRouter);
    this.app.use('/api/analytics', analyticsRouter);
    this.app.use('/api/ai', aiRouter);
    this.app.use('/api/communication', communicationRouter);
    this.app.use('/api/admin', adminRouter);
    
    // Referral link redirect handler (for /r/:shortCode)
    this.app.use('/r', referralRouter);
    
    // Test endpoint
    this.app.get('/api/test', (_req: Request, res: Response) => {
      res.json({ 
        message: 'API is working',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeWebSocket(): void {
    this.io.on('connection', (socket) => {
      console.log('New WebSocket connection:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
      });
    });
    
    // Global error handler
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database first
      await connectDatabase();
      
      this.httpServer.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Root URL: http://localhost:${this.port}/`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default server;