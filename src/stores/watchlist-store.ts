import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchlistItem } from '../types/fund';
import { getFundDetail } from '../services/mf-api';

interface WatchlistStore {
  items: WatchlistItem[];
  addToWatchlist: (schemeCode: number, schemeName: string) => void;
  removeFromWatchlist: (schemeCode: number) => void;
  isInWatchlist: (schemeCode: number) => boolean;
  refreshNAVs: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToWatchlist: (schemeCode: number, schemeName: string) => {
        const { items } = get();
        if (items.some((item) => item.schemeCode === schemeCode)) {
          return;
        }
        set({
          items: [...items, { schemeCode, schemeName }],
        });
      },

      removeFromWatchlist: (schemeCode: number) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.schemeCode !== schemeCode),
        });
      },

      isInWatchlist: (schemeCode: number) => {
        const { items } = get();
        return items.some((item) => item.schemeCode === schemeCode);
      },

      refreshNAVs: async () => {
        const { items } = get();
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const detail = await getFundDetail(item.schemeCode);
              const latestEntry = detail.data[0];
              if (latestEntry) {
                return {
                  ...item,
                  latestNAV: parseFloat(latestEntry.nav),
                  lastUpdated: latestEntry.date,
                  isStale: false,
                };
              }
              return { ...item, isStale: true };
            } catch {
              return { ...item, isStale: true };
            }
          })
        );
        set({ items: updatedItems });
      },
    }),
    {
      name: 'watchlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
