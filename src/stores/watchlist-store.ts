import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getLatestNAV } from "../services/mf-api";
import { WatchlistItem } from "../types/fund";

interface WatchlistStore {
  items: WatchlistItem[];
  addToWatchlist: (
    schemeCode: number,
    schemeName: string,
    latestNAV?: number,
    lastUpdated?: string,
  ) => void;
  removeFromWatchlist: (schemeCode: number) => void;
  isInWatchlist: (schemeCode: number) => boolean;
  refreshNAVs: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToWatchlist: (
        schemeCode: number,
        schemeName: string,
        latestNAV?: number,
        lastUpdated?: string,
      ) => {
        const { items } = get();
        if (items.some((item) => item.schemeCode === schemeCode)) {
          return;
        }
        set({
          items: [...items, { schemeCode, schemeName, latestNAV, lastUpdated }],
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
              const detail = await getLatestNAV(item.schemeCode);
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
          }),
        );
        set({ items: updatedItems });
      },
    }),
    {
      name: "watchlist-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
