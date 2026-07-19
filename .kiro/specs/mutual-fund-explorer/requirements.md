# Requirements Document

## Introduction

The Mutual Fund Explorer feature enables users to search Indian mutual fund schemes, view NAV history with charts and lists, maintain a watchlist of funds, and record holdings to track current value and returns. The feature integrates with the free mfapi.in public API and persists user data locally on the device.

## Glossary

- **Fund_Explorer**: The overall Mutual Fund Explorer feature within the QuickInvest application
- **Search_Screen**: The screen where users search for mutual fund schemes by name
- **Fund_Detail_Screen**: The screen displaying a fund's metadata and NAV history
- **Watchlist_Screen**: The screen showing user-bookmarked funds with latest NAV
- **Holdings_Screen**: The screen showing recorded holdings with computed current value and returns
- **NAV**: Net Asset Value — the per-unit price of a mutual fund on a given trading day
- **Scheme_Code**: A unique numeric identifier for a mutual fund scheme used by AMFI and mfapi.in
- **Trading_Day**: A day on which the stock exchange is open and NAV is published
- **Holdings_Record**: A user-recorded entry consisting of a fund, units held, and purchase date
- **MFAPI**: The external API at mfapi.in providing mutual fund search and NAV history data
- **Local_Storage**: On-device persistence layer (AsyncStorage or MMKV) for watchlist and holdings data

## Requirements

### Requirement 1: Search Mutual Fund Schemes

**User Story:** As a user, I want to search for mutual fund schemes by name, so that I can find funds I am interested in.

#### Acceptance Criteria

1. WHEN a user enters a search query of at least 3 characters, THE Search_Screen SHALL send a request to the MFAPI search endpoint and display matching results
2. WHEN search results are returned, THE Search_Screen SHALL display each result with the scheme name and scheme code
3. WHEN a user taps on a search result, THE Fund_Explorer SHALL navigate to the Fund_Detail_Screen for that scheme
4. WHILE a search request is in progress, THE Search_Screen SHALL display a loading indicator
5. WHEN a search returns no results, THE Search_Screen SHALL display an empty state message indicating no funds were found
6. IF the MFAPI search endpoint returns an error or is unavailable, THEN THE Search_Screen SHALL display an error message with an option to retry
7. WHEN the search query has fewer than 3 characters, THE Search_Screen SHALL not trigger a search request and SHALL display a prompt to enter at least 3 characters

### Requirement 2: View Fund Details and NAV History

**User Story:** As a user, I want to view a fund's details and NAV history, so that I can understand the fund's performance over time.

#### Acceptance Criteria

1. WHEN the Fund_Detail_Screen opens for a scheme, THE Fund_Detail_Screen SHALL fetch NAV history from the MFAPI detail endpoint using the Scheme_Code
2. WHEN NAV data is loaded, THE Fund_Detail_Screen SHALL display the fund name, scheme code, latest NAV, and last-updated date
3. WHEN NAV history is available, THE Fund_Detail_Screen SHALL render a line chart showing NAV values over time
4. WHEN NAV history is available, THE Fund_Detail_Screen SHALL render a scrollable list of NAV entries showing date and value
5. WHILE NAV data is being fetched, THE Fund_Detail_Screen SHALL display a loading indicator
6. IF the MFAPI detail endpoint returns an error or is unavailable, THEN THE Fund_Detail_Screen SHALL display an error message with an option to retry
7. WHEN NAV history contains more than 365 entries, THE Fund_Detail_Screen SHALL provide time-range filter options (1M, 3M, 6M, 1Y, All) to limit chart and list display
8. THE Fund_Detail_Screen SHALL render large NAV history datasets without perceptible jank or frame drops

### Requirement 3: Watchlist Management

**User Story:** As a user, I want to add funds to a watchlist, so that I can quickly check latest NAV values of funds I follow.

#### Acceptance Criteria

1. WHEN a user taps "Add to Watchlist" on the Fund_Detail_Screen, THE Fund_Explorer SHALL persist the fund's scheme code and name to Local_Storage
2. WHEN the Watchlist_Screen opens, THE Watchlist_Screen SHALL load the persisted watchlist from Local_Storage and fetch the latest NAV for each fund
3. WHEN watchlist data is loaded, THE Watchlist_Screen SHALL display each fund's name, latest NAV formatted in INR, and last-updated date
4. WHEN a user swipes or taps remove on a watchlist item, THE Fund_Explorer SHALL remove the fund from Local_Storage and update the displayed list
5. WHEN the watchlist is empty, THE Watchlist_Screen SHALL display an empty state message guiding the user to search and add funds
6. IF fetching latest NAV for a watchlist item fails, THEN THE Watchlist_Screen SHALL display a stale data indicator for that item
7. WHEN a fund is already in the watchlist, THE Fund_Detail_Screen SHALL indicate this visually and disable the add action

### Requirement 4: Holdings Management

**User Story:** As a user, I want to record my mutual fund holdings, so that I can track the current value and returns on my investments.

#### Acceptance Criteria

1. WHEN a user taps "Add Holding" on the Fund_Detail_Screen, THE Fund_Explorer SHALL present a form requesting units held and purchase date
2. WHEN the user submits a valid holding form, THE Fund_Explorer SHALL persist the holding record (scheme code, fund name, units, purchase date) to Local_Storage
3. WHEN the Holdings_Screen opens, THE Holdings_Screen SHALL load persisted holdings from Local_Storage and compute current value and returns for each
4. THE Holdings_Screen SHALL compute current value as: units multiplied by latest NAV
5. THE Holdings_Screen SHALL compute return as: (current value minus invested value) where invested value equals units multiplied by NAV on the purchase date
6. WHEN the purchase date falls on a non-Trading_Day, THE Fund_Explorer SHALL use the NAV from the nearest preceding Trading_Day for invested value calculation
7. WHEN a fund has no NAV data for or before the purchase date, THE Holdings_Screen SHALL display an informational message indicating returns cannot be computed
8. WHEN holdings data is loaded, THE Holdings_Screen SHALL display each holding's fund name, units, purchase NAV, current NAV, current value in INR, and return amount with percentage
9. WHEN a user swipes or taps remove on a holding item, THE Fund_Explorer SHALL remove the holding from Local_Storage and update the displayed list
10. WHEN the holdings list is empty, THE Holdings_Screen SHALL display an empty state message guiding the user to add holdings from fund details

### Requirement 5: Holdings Form Validation

**User Story:** As a user, I want input validation on the holdings form, so that I do not record invalid data.

#### Acceptance Criteria

1. WHEN the user submits the holding form with units that are not a valid positive number, THE Fund_Explorer SHALL display a validation error and prevent submission
2. WHEN the user submits the holding form with a purchase date in the future, THE Fund_Explorer SHALL display a validation error and prevent submission
3. WHEN the user submits the holding form with a purchase date before the fund's earliest available NAV date, THE Fund_Explorer SHALL display a validation error indicating the date is too early
4. WHEN the user enters a valid units value and a valid purchase date, THE Fund_Explorer SHALL enable the submit action

### Requirement 6: Value and Number Formatting

**User Story:** As a user, I want all monetary values and numbers displayed with correct formatting, so that I can read them easily.

#### Acceptance Criteria

1. THE Fund_Explorer SHALL format all monetary values using the Indian Rupee symbol (₹) with the Indian numbering system (lakh/crore grouping)
2. THE Fund_Explorer SHALL display NAV values with up to 4 decimal places
3. THE Fund_Explorer SHALL display unit counts with up to 3 decimal places
4. THE Fund_Explorer SHALL display return percentages with 2 decimal places followed by a percent sign
5. WHEN a return is negative, THE Fund_Explorer SHALL display it in a distinct color (red) to differentiate from positive returns (green)

### Requirement 7: Navigation Structure

**User Story:** As a user, I want clear navigation between search, watchlist, and holdings, so that I can move between features quickly.

#### Acceptance Criteria

1. THE Fund_Explorer SHALL provide a bottom tab navigation with three tabs: Search, Watchlist, and Holdings
2. WHEN the app launches, THE Fund_Explorer SHALL display the Search tab as the default active tab
3. WHEN the user navigates to Fund_Detail_Screen, THE Fund_Explorer SHALL present it as a stack screen above the current tab
4. THE Fund_Explorer SHALL preserve tab state when switching between tabs

### Requirement 8: Data Persistence and Offline Behavior

**User Story:** As a user, I want my watchlist and holdings preserved across app sessions, so that I do not lose my data.

#### Acceptance Criteria

1. THE Fund_Explorer SHALL persist watchlist data to Local_Storage immediately upon any add or remove operation
2. THE Fund_Explorer SHALL persist holdings data to Local_Storage immediately upon any add or remove operation
3. WHEN the app launches without network connectivity, THE Fund_Explorer SHALL display the last-known watchlist and holdings data from Local_Storage
4. WHEN the app regains network connectivity, THE Fund_Explorer SHALL refresh NAV data for watchlist items and holdings
