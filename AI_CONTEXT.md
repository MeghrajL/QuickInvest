# AI_CONTEXT.md

## AI Tools Used

- **Kiro IDE** — AI-powered development environment built on VS Code, used for the entire development workflow
- Kiro's **spec-driven workflow** was used: Requirements → Design → Tasks → Implementation
- Structured spec files guided development with formal requirements, design properties, and ordered implementation tasks

## Where AI Helped

- **Architecture & spec**: Formalized 8 requirements with 49 acceptance criteria, designed component architecture, and generated an ordered task plan
- **Core utilities**: Pure functions for INR formatting (Indian numbering), date parsing/nearest trading day lookup (binary search), returns computation, chart downsampling, and form validation
- **API layer**: Axios instance with request/response interceptors for logging; React Query (TanStack Query v5) for data fetching with caching, retries, and stale-while-revalidate
- **State management**: Zustand stores with AsyncStorage persist middleware for watchlist and holdings
- **UI components**: CRED-inspired dark theme system, reusable components (LoadingIndicator, ErrorState, EmptyState, ConfirmModal, SuccessToast), and screen layouts
- **Data hooks**: `useSearchFunds` (paginated + debounced search), `useFundDetail` (React Query), `useAppRefresh` (AppState-based background refresh)
- **Chart implementation**: react-native-gifted-charts LineChart with dynamic y-axis scaling (yAxisOffset), adaptive x-axis date labels, downsampling, and area gradient fill

## What Required Manual Correction or Redesign

- **Chart y-axis scaling**: AI's initial chart showed NAV data squished at the top because y-axis started from 0. Required computing min/max from data and using `yAxisOffset` prop to zoom into the actual data range.
- **Chart x-axis labels**: Labels showed truncated ("2...") or only one label visible. Required multiple iterations to get proper `spacing` prop usage, label width allocation, and alignment strategies (left/center/right based on position).
- **UUID in React Native**: The `uuid` package requires native crypto. Replaced with a simple `Date.now().toString(36) + Math.random().toString(36)` approach.
- **Expo Go incompatibility**: SDK 57 doesn't support Expo Go. All development done via development builds.
- **Splash screen stuck**: After removing the template's AnimatedSplashOverlay, `SplashScreen.hideAsync()` was never called. Added a `useEffect` to dismiss it on mount.
- **NAV history performance**: FlatList inside ScrollView renders all items (no virtualization). Solved by showing only 50 entries on fund detail with a "View All" button navigating to a separate virtualized screen.
- **Date picker**: Initially used text input for dates. Later integrated `@react-native-community/datetimepicker` for proper native date selection with min/max constraints.
- **API call optimization**: Initially, adding a watchlist item or holding triggered extra API calls to fetch NAV data. Redesigned to pass the already-loaded fund data directly from the Fund Detail screen to the stores, eliminating unnecessary network requests. Watchlist items now store `latestNAV` at add time; holdings compute returns synchronously using `fund.data` already in memory.
- **DateTimePicker API mismatch**: The `@react-native-community/datetimepicker` v9 deprecates `onChange` for `onValueChange`, but the actual runtime signature was ambiguous (sometimes `(event, date)`, sometimes `(date)`). Implemented a defensive handler using `(...args)` with `instanceof Date` checks on both argument positions.

## Key Architectural Decisions and Trade-offs

| Decision                 | Choice                            | Rationale                                                                                                                                                         |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State management         | Zustand v5 + persist              | Lightweight, TypeScript-native, built-in AsyncStorage integration. No boilerplate vs Redux.                                                                       |
| Data fetching            | Axios + React Query v5            | Axios for clean interceptors/logging. React Query for caching, retries, background refetch, request deduplication.                                                |
| Chart library            | react-native-gifted-charts        | Works in Expo managed workflow without native SVG deps. Good enough for financial line charts.                                                                    |
| NAV history pagination   | Separate virtualized screen       | FlatList inside ScrollView can't virtualize. 50 entries on detail + full-screen FlatList for "View All" solves performance.                                       |
| Nearest trading day      | Binary search on descending data  | O(log n) lookup handles non-trading days (weekends/holidays). Falls back to nearest preceding date.                                                               |
| Offline                  | Zustand persist + AppState        | Persisted stores show cached data when offline. Foreground transition triggers refresh. No extra NetInfo dependency.                                              |
| Color system             | Centralized constants             | All colors in `constants/theme.ts` with `Colors`, `AvatarColors`, `Overlays` exports. No hardcoded hex strings in components.                                     |
| Formatting               | `toLocaleString('en-IN')`         | Indian numbering system (lakh/crore) without custom regex. All values to 2 decimal places.                                                                        |
| Form validation          | Real-time + on submit             | Max units validated while typing (instant feedback), date constraints enforced by native picker min/max + programmatic validation as safety net.                  |
| Navigation               | Expo Router file-based            | Type-safe routes, clean URL structure, native stack animations. `[schemeCode].tsx` dynamic segments.                                                              |
| Data passing at add time | Pass fund.data directly to stores | Eliminates API calls when adding watchlist items or holdings. Data already loaded on Fund Detail screen — reuse it locally.                                       |
| Refresh strategy         | Mount-only + AppState foreground  | Both watchlist and holdings refresh only on app launch and when app returns to foreground. No per-tab-switch API calls. Uses `/latest` endpoint for fast refresh. |

## Specific AI Correction Example

**Situation**: The AI set up the NAV chart to show data from 2006-2026 (range: ₹116 to ₹936). The chart rendered a thin line squished into the top 10% of the chart area, with the y-axis running 0-1000 and most of the chart being empty white space below the data.

**Why it was wrong**: `react-native-gifted-charts` defaults to y-axis starting at 0. For mutual fund NAV data that never goes near 0, this wastes 90% of the chart height.

**My fix**: Computed `minNav` and `maxNav` from the actual data, then set `yAxisOffset = floor(min - 10% of range)` and `maxValue = ceil(max + 10% padding) - offset`. This makes the chart "zoom in" to the actual data range, using the full chart height for the line.

**Outcome**: The line now fills the entire 160px chart height, clearly showing the growth from ₹116 to ₹936 across 20 years. Y-axis labels show the actual NAV range (~100-~950) instead of 0-1000.

## What I Would Improve With More Time

1. **Skeleton loading screens** — Replace spinner indicators with shimmer/skeleton patterns for better perceived performance
2. **Pull-to-refresh** — `RefreshControl` on watchlist and holdings for manual data refresh
3. **Chart touch interaction** — Touch-to-inspect tooltip showing exact NAV and date at finger position
4. **Error boundaries** — React error boundaries per section to prevent full-screen crashes
5. **Unit tests** — Jest + React Native Testing Library for hooks, stores, and screen-level integration tests
6. **Swipe-to-delete** — Gesture-based deletion using `react-native-gesture-handler` Swipeable
7. **NAV change indicator** — Day-over-day percentage change badge on watchlist items
8. **Search suggestions** — Recent searches stored in AsyncStorage for quick repeat access
9. **Multiple holdings per fund** — Currently one holding per fund; support multiple buy entries with different dates
10. **Haptic feedback** — Add haptics on button presses and successful actions for premium feel
