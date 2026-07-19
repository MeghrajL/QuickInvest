import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useWatchlistStore } from '@/stores/watchlist-store';
import { useHoldingsStore } from '@/stores/holdings-store';

/**
 * Hook that refreshes watchlist NAVs and holdings data when the app
 * comes back to the foreground. This handles the "regain connectivity"
 * use case — users typically lose connectivity, switch to another app,
 * and return once back online.
 *
 * The existing Zustand persist middleware ensures cached data is shown
 * when offline (Requirement 8.3). This hook satisfies Requirement 8.4
 * by triggering a data refresh on app foreground transitions.
 */
export function useAppRefresh(): void {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const refreshNAVs = useWatchlistStore((state) => state.refreshNAVs);
  const refreshHoldings = useHoldingsStore((state) => state.refreshHoldings);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        // Trigger refresh when transitioning from background/inactive to active
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // Fire-and-forget — errors are handled gracefully inside the stores
          refreshNAVs();
          refreshHoldings();
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [refreshNAVs, refreshHoldings]);
}
