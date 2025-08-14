import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { referralApi } from '../services/referral.api';

interface ReferralLink {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  customMessage?: string;
  clicks: number;
  conversions: number;
  expiresAt?: string;
  createdAt: string;
  qrCode?: string;
}

interface ReferralStore {
  links: ReferralLink[];
  currentLink: ReferralLink | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLinks: () => Promise<void>;
  createLink: (data: any) => Promise<ReferralLink>;
  selectLink: (link: ReferralLink) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  links: [],
  currentLink: null,
  isLoading: false,
  error: null,
};

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchLinks: async () => {
        set({ isLoading: true, error: null });
        try {
          const links = await referralApi.getUserLinks();
          
          // Since we have one-link-per-user system, set the first link as current
          const currentLink = links.length > 0 ? links[0] : null;
          
          set({ 
            links: Array.isArray(links) ? links : [], 
            currentLink,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error fetching links:', error);
          set({ 
            error: error.message || 'Failed to fetch links', 
            isLoading: false 
          });
        }
      },

      createLink: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const newLink = await referralApi.createLink(data);
          
          // The backend now returns the correct URL format
          // url: "https://instabids.ai?ref=ABC123"
          // No need to manually construct it
          if (!newLink.shortUrl && newLink.url) {
            newLink.shortUrl = newLink.url;
          }
          
          // Update the links array (replace existing since one-link-per-user)
          set(state => ({
            links: [newLink],
            currentLink: newLink,
            isLoading: false
          }));
          
          return newLink;
        } catch (error: any) {
          console.error('Error creating link:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Failed to create link';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },

      selectLink: (link: ReferralLink) => {
        set({ currentLink: link });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'referral-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        links: state.links,
        currentLink: state.currentLink,
      }),
    }
  )
);

// Helper hook to get the current/primary link
export const useCurrentLink = () => {
  const { currentLink, links, fetchLinks } = useReferralStore();
  
  // If no current link but we have links, set the first one
  if (!currentLink && links.length > 0) {
    return links[0];
  }
  
  return currentLink;
};