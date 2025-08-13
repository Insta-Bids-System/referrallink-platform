import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

// Using Supabase PostgreSQL connection
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'db.zyxeshuhnzkltlatsmxn.supabase.co',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    // Force IPv4 connection for Railway deployment
    family: 4
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models manually
import { User } from '../models/User.sequelize';
import { ReferralLink } from '../models/ReferralLink.sequelize';
import { Click } from '../models/Click.sequelize';
import { Conversion } from '../models/Conversion.sequelize';

// Add models to sequelize
sequelize.addModels([User, ReferralLink, Click, Conversion]);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models with database
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📊 Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    console.log('⚠️ Running without database - API will work with limited functionality');
    // Don't throw error - allow server to start without database for testing
  }
};

export default sequelize;