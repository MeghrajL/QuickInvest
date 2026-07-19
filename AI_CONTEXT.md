# AI_CONTEXT.md

## AI Tools Used

- **Kiro IDE** (AI-powered development environment) — Used for spec-driven development workflow (requirements → design → tasks → implementation)
- Kiro's structured spec feature was used to formalize requirements, generate a design document with architecture diagrams, and break implementation into ordered tasks
- Property-based testing with **fast-check** was integrated into the workflow to validate correctness properties defined in the design document

## Where AI Helped

- **Spec generation**: Requirements document with 8 formal requirements and 49 acceptance criteria, covering search, fund details, watchlist, holdings, validation, formatting, navigation, and persistence
- **Architecture design**: Data flow diagram, component structure, state management design, API layer design, and correctness properties
- **Task breakdown**: 17 ordered implementation tasks with dependency tracking and requirement traceability
- **Utility implementations**: Pure functions for formatting (INR, NAV, units, percentage), date handling (parseNAVDate, findNearestTradingDay), returns computation, chart downsampling, and form validation
- **API layer**: Custom fetch wrapper (`src/services/api.ts`) with retry logic (exponential backoff), timeout via AbortController, and error type classification
- **State management**: Zustand stores (`watchlist-store.ts`, `holdings-store.ts`) with AsyncStorage persistence middleware
- **Custom hooks**: `useSearchFunds` (debounced search with cancellation), `useFundDetail` (fetch on mount with error handling), `useAppRefresh` (connectivity-aware refresh)
- **Component scaffolding**: Shared UI components (LoadingIndicator, ErrorState, EmptyState), domain-specific components (NAVChart, HoldingForm, WatchlistItem, HoldingItem)
- **Screen composition**: Search, Fund Detail, Watchlist, and Holdings screens wired with hooks, stores, and proper state handling
- **Property-based tests**: 10 correctness properties validated with fast-check covering formatting, returns computation, date lookup, chart filtering, and form validation

## What Required Manual Correction or Redesign

- **UUID generation**: The initial suggestion used the `uuid` npm package, but this has known issues in React Native environments (requires native crypto polyfill). Replaced with a simpler `Date.now().toString(36) + Math.random().toString(36)` approach that's reliable across all platforms without native module linking.
- **Expo SDK 57 compatibility**: The project uses SDK 57 which doesn't support Expo Go. Development builds were required instead, which affected the choice of dependencies (avoiding packages that need native linking beyond what Expo manages).
- **NativeTabs → standard Tabs**: The original project template used `NativeTabs` from `expo-router/unstable-native-tabs`, which was replaced with the standard `Tabs` component from `expo-router` for stability and broader platform support.
- **Date picker simplification**: Instead of a complex native date picker component (which would require `@react-native-community/datetimepicker` and additional native modules), a simple text input with YYYY-MM-DD format was used for the purchase date field in the holdings form.
- **Swipe-to-delete simplification**: Simplified from gesture-based swipe-to-delete to a tap-to-remove button approach to avoid gesture handler configuration complexity within the assignment timeline.
- **Chart library selection**: The AI initially considered `react-native-chart-kit` which depends on `react-native-svg` (native module). Switched to `react-native-gifted-charts` which works without additional native setup in the managed Expo workflow.
- **Offline detection**: Opted against adding `@react-native-community/netinfo` as a separate dependency. Instead, used AppState listener for foreground transitions to trigger data refresh, and the API error handling naturally shows cached data when network is unavailable.

## Key Architectural Decisions and Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Zustand v5 with persist middleware | Lightweight, TypeScript-native, built-in AsyncStorage integration via persist middleware. No boilerplate compared to Redux. |
| API approach | Custom fetch wrapper (`src/services/api.ts`) | Minimal dependency footprint, handles retries (2 max) and timeouts (10s) without React Query or SWR overhead. Good enough for this scope. |
| Chart library | react-native-gifted-charts | No native dependencies required, works in managed Expo workflow, reasonable performance with downsampled data. |
| Data downsampling | Uniform sampling (80-100 points) | NAV history can be thousands of entries. Downsampling to ~100 points keeps chart rendering fast while preserving visual trends. |
| Nearest trading day | Binary search on sorted data | O(log n) lookup for finding purchase NAV on non-trading days. The API returns data in descending order which we reverse for binary search. |
| Offline strategy | Persist middleware + AppState refresh | No extra native package (NetInfo) needed. Persisted stores show cached data when offline; foreground transitions trigger refresh attempts. |
| Navigation | Expo Router file-based + Tabs | Follows Expo conventions, clean URL structure, type-safe route params via `[schemeCode].tsx`. |
| Formatting | `toLocaleString('en-IN')` | Leverages built-in Intl support for Indian numbering system (lakh/crore grouping) without custom formatting implementations. |
| Search debounce | Custom setTimeout in hook | 300ms debounce with cleanup on unmount. Simple, no external dependency, handles cancellation of stale requests. |
| Testing | fast-check property-based tests | Validates correctness properties across random inputs rather than just example cases. 100+ iterations per property. |

## Specific AI Correction Example

**Situation**: The AI initially suggested using `react-native-chart-kit` for the NAV history chart component in the Fund Detail screen.

**Why I overrode it**: `react-native-chart-kit` depends on `react-native-svg` which requires native module linking. Since we're using Expo managed workflow (SDK 57) and the assignment emphasizes minimal native setup, this would have added build complexity. Additionally, `react-native-svg` can cause issues with certain Expo SDK versions.

**What I chose instead**: `react-native-gifted-charts` — a pure JavaScript charting solution that renders using React Native's built-in components. Combined with a uniform downsampling strategy (capping data at 100 points), the chart renders cleanly without native build issues.

**Outcome**: The chart renders NAV history smoothly with no native linking required. The downsampling approach (`src/utils/chart.ts`) ensures performance stays consistent regardless of how large the dataset is (some funds have 5000+ NAV entries).

## What I Would Improve With More Time

1. **React Query / TanStack Query** — Replace custom hooks with React Query for better caching, background refetching, request deduplication, and stale-while-revalidate patterns
2. **Comprehensive error boundaries** — Add React error boundaries around each screen section to prevent full-screen crashes from rendering errors
3. **Animated transitions** — Add layout animations (Reanimated) for adding/removing watchlist and holdings items
4. **Native date picker** — Integrate `@react-native-community/datetimepicker` for better UX when selecting purchase dates
5. **Pull-to-refresh** — Add `RefreshControl` to watchlist and holdings FlatLists for manual data refresh
6. **Integration tests** — Screen-level tests using React Native Testing Library to verify full user flows
7. **NAV change indicator** — Show day-over-day NAV change percentage in the watchlist for quick trend visibility
8. **Search history** — Cache recent search queries in AsyncStorage for quick repeat access
9. **Chart interactions** — Touch-to-inspect with tooltip showing exact NAV value and date at the touch point
10. **Skeleton loading states** — Replace spinner loading indicators with skeleton screen patterns for perceived performance
11. **Gesture-based deletion** — Proper swipe-to-delete with `react-native-gesture-handler` Swipeable component
12. **Data export** — Allow users to export holdings data as CSV for portfolio tracking in external tools

## Project Structure Reference

```
src/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root Stack navigator
│   ├── (tabs)/                  # Tab navigator group
│   │   ├── _layout.tsx          # Tab configuration (Search, Watchlist, Holdings)
│   │   ├── index.tsx            # Search screen (default tab)
│   │   ├── watchlist.tsx        # Watchlist screen
│   │   └── holdings.tsx         # Holdings screen
│   └── fund/
│       └── [schemeCode].tsx     # Fund Detail screen (stack push)
├── components/
│   ├── ui/                      # Shared UI (LoadingIndicator, ErrorState, EmptyState)
│   ├── search/                  # SearchInput, SearchResultItem
│   ├── fund-detail/             # NAVChart, TimeRangeFilter, NAVHistoryList, HoldingForm
│   ├── watchlist/               # WatchlistItem
│   └── holdings/                # HoldingItem
├── hooks/
│   ├── use-search-funds.ts      # Debounced search hook
│   ├── use-fund-detail.ts       # Fund detail fetching hook
│   └── use-app-refresh.ts       # AppState-based refresh hook
├── services/
│   ├── api.ts                   # Fetch wrapper with retry + timeout
│   └── mf-api.ts               # mfapi.in endpoint functions
├── stores/
│   ├── watchlist-store.ts       # Zustand + persist (AsyncStorage)
│   └── holdings-store.ts        # Zustand + persist (AsyncStorage)
├── types/
│   └── fund.ts                  # All TypeScript interfaces
└── utils/
    ├── format.ts                # formatINR, formatNAV, formatUnits, formatPercentage, getReturnColor
    ├── date.ts                  # parseNAVDate, formatDisplayDate, findNearestTradingDay
    ├── returns.ts               # computeCurrentValue, computeReturn
    ├── chart.ts                 # downsampleNAVData, filterByTimeRange
    └── validation.ts            # validateHoldingForm
```

## API Reference

- **Base URL**: `https://api.mfapi.in/mf`
- **Search**: `GET /mf/search?q={query}` → `FundSearchResult[]`
- **Fund Detail**: `GET /mf/{schemeCode}` → `FundDetail` (meta + NAV history)
- **Rate limits**: None (public API), but we apply 10s timeout and 2 retries with backoff
- **Data format**: NAV dates in `dd-MM-yyyy`, NAV values as strings (parsed to numbers client-side)
