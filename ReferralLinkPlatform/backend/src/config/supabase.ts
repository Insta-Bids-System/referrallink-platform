import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase client with service role for backend operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Supabase client with anon key for public operations
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          first_name: string;
          last_name: string;
          phone_number: string | null;
          profile_picture: string | null;
          profile: any;
          writing_style: any | null;
          auth_providers: any[];
          preferences: any;
          is_active: boolean;
          is_verified: boolean;
          role: 'user' | 'premium' | 'admin' | 'super_admin';
          refresh_token: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      referral_links: {
        Row: {
          id: string;
          user_id: string;
          short_code: string;
          original_url: string;
          company_url: string;
          custom_message: string | null;
          metadata: any;
          statistics: any;
          expires_at: string | null;
          is_active: boolean;
          is_primary: boolean;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['referral_links']['Row'], 'id' | 'created_at' | 'updated_at' | 'short_code'> & {
          id?: string;
          short_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['referral_links']['Insert']>;
      };
      clicks: {
        Row: {
          id: string;
          referral_link_id: string;
          ip_address: string;
          user_agent: string;
          referer: string | null;
          country: string | null;
          city: string | null;
          region: string | null;
          device: string;
          browser: string;
          os: string;
          clicked_at: string;
          metadata: any | null;
        };
        Insert: Omit<Database['public']['Tables']['clicks']['Row'], 'id' | 'clicked_at'> & {
          id?: string;
          clicked_at?: string;
        };
        Update: Partial<Database['public']['Tables']['clicks']['Insert']>;
      };
      conversions: {
        Row: {
          id: string;
          referral_link_id: string;
          click_id: string;
          converted_user_id: string | null;
          conversion_type: 'signup' | 'purchase' | 'subscription' | 'custom';
          conversion_value: number | null;
          currency: string;
          metadata: any | null;
          converted_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversions']['Row'], 'id' | 'converted_at'> & {
          id?: string;
          converted_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversions']['Insert']>;
      };
    };
    Views: {
      link_analytics: {
        Row: {
          id: string;
          user_id: string;
          short_code: string;
          original_url: string;
          expires_at: string | null;
          is_active: boolean;
          total_clicks: number;
          unique_clicks: number;
          conversions: number;
          conversion_rate: number;
          last_clicked_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      generate_short_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      user_owns_link: {
        Args: { link_id: string };
        Returns: boolean;
      };
      get_user_role: {
        Args: { user_id: string };
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    throw new Error('No data found');
  }
  
  if (error.code === '23505') {
    throw new Error('Duplicate entry');
  }
  
  if (error.code === '23503') {
    throw new Error('Foreign key constraint violation');
  }
  
  throw new Error(error.message || 'Database operation failed');
}