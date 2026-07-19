import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getFundDetail } from "../services/mf-api";
import { HoldingRecord } from "../types/fund";
import { findNearestTradingDay } from "../utils/date";
import { computeCurrentValue, computeReturn } from "../utils/returns";

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

/**
 * Compute returns for a single holding given fund detail data.
 */
async function computeHoldingReturns(
  holding: HoldingRecord,
): Promise<HoldingRecord> {
  try {
    const detail = await getFundDetail(holding.schemeCode);
    const latestEntry = detail.data[0];

    if (!latestEntry) {
      return holding;
    }

    const currentNAV = parseFloat(latestEntry.nav);
    const purchaseDate = new Date(holding.purchaseDate);
    const purchaseEntry = findNearestTradingDay(purchaseDate, detail.data);

    if (!purchaseEntry) {
      return {
        ...holding,
        currentNAV,
        currentValue: computeCurrentValue(holding.units, currentNAV),
      };
    }

    const purchaseNAV = parseFloat(purchaseEntry.nav);
    const currentValue = computeCurrentValue(holding.units, currentNAV);
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
    return holding;
  }
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
        // Add immediately (shows "Returns unavailable" briefly)
        set({ holdings: [...holdings, newHolding] });

        // Then compute returns async and update
        computeHoldingReturns(newHolding).then((computed) => {
          const { holdings: current } = get();
          set({
            holdings: current.map((h) => (h.id === computed.id ? computed : h)),
          });
        });
      },

      removeHolding: (id: string) => {
        const { holdings } = get();
        set({ holdings: holdings.filter((h) => h.id !== id) });
      },

      refreshHoldings: async () => {
        const { holdings } = get();
        const updatedHoldings = await Promise.all(
          holdings.map(computeHoldingReturns),
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
