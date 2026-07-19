import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getFundDetail } from "../services/mf-api";
import { HoldingRecord } from "../types/fund";
import { findNearestTradingDay } from "../utils/date";
import { computeCurrentValue, computeReturn } from "../utils/returns";

/**
 * Generate a unique ID for holdings.
 * Uses a simple approach that works reliably in React Native
 * without native module dependencies.
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface HoldingsStore {
  holdings: HoldingRecord[];
  addHolding: (
    holding: Omit<
      HoldingRecord,
      "id" | "currentNAV" | "currentValue" | "returnAmount" | "returnPercentage"
    >,
  ) => void;
  removeHolding: (id: string) => void;
  refreshHoldings: () => Promise<void>;
}

export const useHoldingsStore = create<HoldingsStore>()(
  persist(
    (set, get) => ({
      holdings: [],

      addHolding: (
        holding: Omit<
          HoldingRecord,
          | "id"
          | "currentNAV"
          | "currentValue"
          | "returnAmount"
          | "returnPercentage"
        >,
      ) => {
        const { holdings } = get();
        const newHolding: HoldingRecord = {
          ...holding,
          id: generateId(),
        };
        set({ holdings: [...holdings, newHolding] });
      },

      removeHolding: (id: string) => {
        const { holdings } = get();
        set({ holdings: holdings.filter((h) => h.id !== id) });
      },

      refreshHoldings: async () => {
        const { holdings } = get();
        const updatedHoldings = await Promise.all(
          holdings.map(async (holding) => {
            try {
              const detail = await getFundDetail(holding.schemeCode);
              const latestEntry = detail.data[0];

              if (!latestEntry) {
                return holding;
              }

              const currentNAV = parseFloat(latestEntry.nav);

              // Find purchase NAV using nearest preceding trading day
              const purchaseDate = new Date(holding.purchaseDate);
              const purchaseEntry = findNearestTradingDay(
                purchaseDate,
                detail.data,
              );

              if (!purchaseEntry) {
                // Cannot compute returns if no NAV data for/before purchase date
                return {
                  ...holding,
                  currentNAV,
                  currentValue: computeCurrentValue(holding.units, currentNAV),
                };
              }

              const purchaseNAV = parseFloat(purchaseEntry.nav);
              const currentValue = computeCurrentValue(
                holding.units,
                currentNAV,
              );
              const { returnAmount, returnPercentage } = computeReturn(
                holding.units,
                currentNAV,
                purchaseNAV,
              );

              return {
                ...holding,
                purchaseNAV,
                currentNAV,
                currentValue,
                returnAmount,
                returnPercentage,
              };
            } catch {
              // If fetch fails, keep existing holding data unchanged
              return holding;
            }
          }),
        );
        set({ holdings: updatedHoldings });
      },
    }),
    {
      name: "holdings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
