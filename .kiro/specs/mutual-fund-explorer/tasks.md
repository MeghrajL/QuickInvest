# Implementation Plan: Mutual Fund Explorer

## Overview

Incremental implementation of the Mutual Fund Explorer feature for the QuickInvest Expo app. Tasks are ordered so each step builds on the previous, starting with types and utilities, then API layer, state management, navigation, and finally screens with full integration. Property-based tests validate pure utility functions; unit tests cover hooks, stores, and components.

## Tasks

- [x] 1. Set up project structure, dependencies, and TypeScript types
  - [x] 1.1 Install dependencies: zustand, @react-native-async-storage/async-storage, react-native-gifted-charts, fast-check, uuid
    - Run `npm install zustand @react-native-async-storage/async-storage react-native-gifted-charts` and `npm install -D fast-check @types/uuid uuid`
    - _Requirements: All_

  - [x] 1.2 Create TypeScript type definitions
    - Create `src/types/fund.ts` with all interfaces: FundSearchResult, NAVEntry, FundMeta, FundDetail, WatchlistItem, HoldingRecord, TimeRange
    - _Requirements: 2.1, 3.1, 4.1_

  - [x] 1.3 Create folder structure
    - Create directories: `src/stores/`, `src/services/`, `src/utils/`, `src/components/search/`, `src/components/fund-detail/`, `src/components/watchlist/`, `src/components/holdings/`, `src/app/(tabs)/`, `src/app/fund/`
    - _Requirements: 7.1_

- [x] 2. Implement utility functions
  - [x] 2.1 Implement formatting utilities
    - Create `src/utils/format.ts` with: formatINR (Indian numbering with ₹), formatNAV (up to 4 decimals), formatUnits (up to 3 decimals), formatPercentage (2 decimals + %), getReturnColor (red for negative, green for positive)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x]\* 2.2 Write property tests for formatting utilities
    - Create `src/utils/__tests__/format.property.test.ts`
    - **Property 6: INR formatting structure** — generate random non-negative numbers, verify ₹ prefix and Indian comma grouping
    - **Property 7: NAV decimal formatting** — generate random numbers, verify ≤ 4 decimal places
    - **Property 8: Units decimal formatting** — generate random numbers, verify ≤ 3 decimal places
    - **Property 9: Percentage formatting** — generate random numbers, verify ends with %, exactly 2 decimal places
    - **Property 10: Return color classification** — generate random numbers, verify red for negative, green for non-negative
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

  - [x] 2.3 Implement date utilities
    - Create `src/utils/date.ts` with: parseNAVDate (dd-MM-yyyy → Date), formatDisplayDate (Date → "dd MMM yyyy"), findNearestTradingDay (binary search on sorted NAV entries for nearest preceding date)
    - _Requirements: 4.6_

  - [x]\* 2.4 Write property test for nearest trading day lookup
    - Create `src/utils/__tests__/date.property.test.ts`
    - **Property 3: Nearest preceding trading day lookup** — generate random sorted date arrays and target dates, verify returned date ≤ target and is maximum satisfying this
    - **Validates: Requirements 4.6**

  - [x] 2.5 Implement returns computation utilities
    - Create `src/utils/returns.ts` with: computeCurrentValue (units × currentNAV), computeReturn ({returnAmount, returnPercentage})
    - _Requirements: 4.4, 4.5_

  - [x]\* 2.6 Write property test for returns computation
    - Create `src/utils/__tests__/returns.property.test.ts`
    - **Property 2: Returns computation correctness** — generate random (units, currentNAV, purchaseNAV) tuples, verify currentValue = units × currentNAV, returnAmount = currentValue − investedValue, returnPercentage = (returnAmount / investedValue) × 100
    - **Validates: Requirements 4.4, 4.5**

  - [x] 2.7 Implement chart utilities
    - Create `src/utils/chart.ts` with: downsampleNAVData (reduce to maxPoints using LTTB or uniform sampling), filterByTimeRange (filter entries by 1M/3M/6M/1Y/ALL relative to most recent entry)
    - _Requirements: 2.7, 2.8_

  - [x]\* 2.8 Write property test for time range filtering
    - Create `src/utils/__tests__/chart.property.test.ts`
    - **Property 1: Time range filter correctness** — generate random NAV arrays and time ranges, verify all returned entries are within range and no valid entries excluded
    - **Validates: Requirements 2.7**

  - [x] 2.9 Implement holdings form validation
    - Create `src/utils/validation.ts` with: validateHoldingForm (checks units > 0, date not future, date not before earliest NAV)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x]\* 2.10 Write property tests for holdings validation
    - Create `src/utils/__tests__/validation.property.test.ts`
    - **Property 4: Holdings form rejects all invalid inputs** — generate invalid (negative/zero units, future dates, too-early dates), verify rejection
    - **Property 5: Holdings form accepts all valid inputs** — generate valid (positive units, date in range), verify acceptance
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 3. Checkpoint - Verify utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement API layer
  - [x] 4.1 Create API client with retry logic
    - Create `src/services/api.ts` with fetchWithRetry: timeout (10s via AbortController), exponential backoff (max 2 retries), error type mapping
    - _Requirements: 1.6, 2.6_

  - [x] 4.2 Create mfapi.in service functions
    - Create `src/services/mf-api.ts` with: searchFunds(query) → FundSearchResult[], getFundDetail(schemeCode) → FundDetail
    - Base URL: `https://api.mfapi.in/mf`
    - _Requirements: 1.1, 2.1_

  - [x]\* 4.3 Write unit tests for API service
    - Mock fetch, test searchFunds and getFundDetail request formation, error handling, retry behavior
    - _Requirements: 1.6, 2.6_

- [x] 5. Implement state management (Zustand stores)
  - [x] 5.1 Create watchlist store
    - Create `src/stores/watchlist-store.ts` with Zustand + persist middleware (AsyncStorage): items, addToWatchlist, removeFromWatchlist, isInWatchlist, refreshNAVs
    - _Requirements: 3.1, 3.2, 3.4, 8.1_

  - [x] 5.2 Create holdings store
    - Create `src/stores/holdings-store.ts` with Zustand + persist middleware (AsyncStorage): holdings, addHolding (with UUID generation), removeHolding, refreshHoldings (fetches current NAV + computes returns using utils)
    - _Requirements: 4.2, 4.3, 4.9, 8.2_

  - [x]\* 5.3 Write unit tests for stores
    - Test add/remove operations, persistence integration, refreshNAVs/refreshHoldings with mocked API
    - _Requirements: 3.1, 3.4, 4.2, 4.9, 8.1, 8.2_

- [x] 6. Implement custom hooks
  - [x] 6.1 Create useSearchFunds hook
    - Create `src/hooks/use-search-funds.ts`: debounce 300ms, min 3 chars guard, cancellation on new query, returns {results, isLoading, error, retry}
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7_

  - [x] 6.2 Create useFundDetail hook
    - Create `src/hooks/use-fund-detail.ts`: fetch on mount with schemeCode param, returns {fund, isLoading, error, retry}
    - _Requirements: 2.1, 2.5, 2.6_

  - [x]\* 6.3 Write unit tests for hooks
    - Mock API layer, test state transitions (loading → success, loading → error), debounce behavior, min-length guard
    - _Requirements: 1.1, 1.4, 1.7, 2.1, 2.5_

- [x] 7. Checkpoint - Verify data layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Set up navigation structure
  - [x] 8.1 Create root layout with stack navigator
    - Modify `src/app/_layout.tsx` to use Stack navigator wrapping the tabs group and fund detail screen
    - _Requirements: 7.3_

  - [x] 8.2 Create tab layout
    - Create `src/app/(tabs)/_layout.tsx` with 3 tabs: Search (index), Watchlist, Holdings using existing NativeTabs pattern from project
    - Update `src/components/app-tabs.tsx` to include the 3 new tabs
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 9. Implement Search screen
  - [x] 9.1 Create shared UI components
    - Create `src/components/ui/LoadingIndicator.tsx`, `src/components/ui/ErrorState.tsx`, `src/components/ui/EmptyState.tsx`
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 9.2 Create SearchInput component
    - Create `src/components/search/SearchInput.tsx`: styled TextInput with clear button
    - _Requirements: 1.1, 1.7_

  - [x] 9.3 Create SearchResultItem component
    - Create `src/components/search/SearchResultItem.tsx`: Pressable row showing scheme name + code
    - _Requirements: 1.2, 1.3_

  - [x] 9.4 Implement Search screen
    - Create `src/app/(tabs)/index.tsx`: wire SearchInput → useSearchFunds → FlatList of SearchResultItem, handle all states (idle, loading, results, empty, error), navigate to fund detail on tap
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 10. Implement Fund Detail screen
  - [x] 10.1 Create NAVChart component
    - Create `src/components/fund-detail/NAVChart.tsx`: LineChart from react-native-gifted-charts, accepts downsampled data, responsive sizing
    - _Requirements: 2.3, 2.8_

  - [x] 10.2 Create TimeRangeFilter component
    - Create `src/components/fund-detail/TimeRangeFilter.tsx`: horizontal row of filter pills (1M, 3M, 6M, 1Y, All), active state styling
    - _Requirements: 2.7_

  - [x] 10.3 Create NAVHistoryList component
    - Create `src/components/fund-detail/NAVHistoryList.tsx`: FlatList of NAV entries with date and formatted value
    - _Requirements: 2.4_

  - [x] 10.4 Create HoldingForm component
    - Create `src/components/fund-detail/HoldingForm.tsx`: Modal with units input (numeric), date picker, inline validation errors, submit/cancel buttons
    - Uses validateHoldingForm from utils
    - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4_

  - [x] 10.5 Implement Fund Detail screen
    - Create `src/app/fund/[schemeCode].tsx`: wire useFundDetail → header (name, code, latest NAV, date) + NAVChart + TimeRangeFilter + NAVHistoryList + action buttons (Add to Watchlist with toggle state, Add Holding opening form modal)
    - Show time range filter only when > 365 entries
    - Use downsampleNAVData for chart (max 100 points)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.7, 4.1_

- [x] 11. Checkpoint - Verify search and detail flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Watchlist screen
  - [x] 12.1 Create WatchlistItem component
    - Create `src/components/watchlist/WatchlistItem.tsx`: fund name, latest NAV (₹ formatted), last updated date, stale indicator badge when isStale
    - _Requirements: 3.3, 3.6_

  - [x] 12.2 Implement Watchlist screen
    - Create `src/app/(tabs)/watchlist.tsx`: load from store, call refreshNAVs on mount, FlatList with swipe-to-delete (react-native-gesture-handler), empty state, navigate to fund detail on tap
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 13. Implement Holdings screen
  - [x] 13.1 Create HoldingItem component
    - Create `src/components/holdings/HoldingItem.tsx`: fund name, units (formatted), purchase NAV, current NAV, current value (₹), return amount + percentage with color coding
    - _Requirements: 4.8, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 13.2 Implement Holdings screen
    - Create `src/app/(tabs)/holdings.tsx`: load from store, call refreshHoldings on mount, FlatList with swipe-to-delete, each item shows computed returns, handle "returns unavailable" case, empty state
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 14. Implement offline behavior and data refresh
  - [x] 14.1 Add network connectivity detection
    - Use React Native's NetInfo or a simple connectivity check in the API layer
    - When offline: skip API calls, display cached store data
    - When connectivity restored: trigger refreshNAVs and refreshHoldings
    - _Requirements: 8.3, 8.4_

- [x] 15. Checkpoint - Full feature integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Polish and performance optimization
  - [x] 16.1 Add performance optimizations
    - Memoize FlatList renderItem with React.memo, add keyExtractor
    - Ensure chart downsampling caps at 100 points
    - Add proper list item heights for getItemLayout where applicable
    - _Requirements: 2.8_

  - [x] 16.2 Create AI_CONTEXT.md documentation
    - Document the feature architecture, key decisions, API usage, and store structure for future AI-assisted development
    - _Requirements: All_

- [x] 17. Final checkpoint - All tests green
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based / unit test sub-tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major milestones
- The project uses TypeScript throughout with strict mode enabled
- Property-based tests use fast-check with minimum 100 iterations
- The existing NativeTabs pattern from `src/components/app-tabs.tsx` should be extended for the 3-tab layout
