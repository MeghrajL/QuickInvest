import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getFundDetail, getLatestNAV } from "../services/mf-api";
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
    navData?: Array<{ date: string; nav: string }>,
  ) => void;
  removeHolding: (id: string) => void;
  refreshHoldings: () => Promise<void>;
}

/**
 * Full computation — fetches entire NAV history to find purchase date NAV.
 * Used only when adding a new holding (purchaseNAV not yet known).
 */
async function computeHoldingFull(
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

/**
 * Light refresh — only fetches latest NAV and recomputes returns
 * using the already-stored purchaseNAV. Much faster than full computation.
 */
async function refreshHoldingLight(
  holding: HoldingRecord,
): Promise<HoldingRecord> {
  try {
    const detail = await getLatestNAV(holding.schemeCode);
    const latestEntry = detail.data[0];

    if (!latestEntry) {
      return holding;
    }

    const currentNAV = parseFloat(latestEntry.nav);
    const currentValue = computeCurrentValue(holding.units, currentNAV);

    if (holding.purchaseNAV == null) {
      // No purchaseNAV stored — can't compute returns with light refresh
      return { ...holding, currentNAV, currentValue };
    }

    const { returnAmount, returnPercentage } = computeReturn(
      holding.units,
      currentNAV,
      holding.purchaseNAV,
    );

    return {
      ...holding,
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
        navData?: Array<{ date: string; nav: string }>,
      ) => {
        const { holdings } = get();
        const newHolding: HoldingRecord = {
          ...holding,
          id: generateId(),
        };

        // If navData is provided, compute returns synchronously (no API call)
        if (navData && navData.length > 0) {
          const currentNAV = parseFloat(navData[0].nav);
          const purchaseDate = new Date(holding.purchaseDate);
          const purchaseEntry = findNearestTradingDay(purchaseDate, navData);

          if (purchaseEntry) {
            const purchaseNAV = parseFloat(purchaseEntry.nav);
            const currentValue = computeCurrentValue(holding.units, currentNAV);
            const { returnAmount, returnPercentage } = computeReturn(
              holding.units,
              currentNAV,
              purchaseNAV,
            );
            const computed: HoldingRecord = {
              ...newHolding,
              purchaseNAV,
              currentNAV,
              currentValue,
              returnAmount,
              returnPercentage,
            };
            set({ holdings: [...holdings, computed] });
            return;
          }

          // Purchase NAV not found but we have current NAV
          const currentValue = computeCurrentValue(holding.units, currentNAV);
          set({
            holdings: [
              ...holdings,
              { ...newHolding, currentNAV, currentValue },
            ],
          });
          return;
        }

        // Fallback: no navData provided, do async computation
        set({ holdings: [...holdings, newHolding] });
        computeHoldingFull(newHolding).then((computed) => {
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
          holdings.map((holding) => {
            // If purchaseNAV is already computed, use light refresh (fast)
            if (holding.purchaseNAV != null) {
              return refreshHoldingLight(holding);
            }
            // Otherwise do full computation (slow but needed)
            return computeHoldingFull(holding);
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
