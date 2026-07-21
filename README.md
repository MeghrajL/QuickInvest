# QuickInvest — Mutual Fund Explorer

A React Native (Expo) application for exploring Indian mutual funds, viewing NAV history, maintaining a watchlist, and tracking holdings with computed returns.

## Tech Stack

- **Framework**: React Native with Expo SDK 57 (managed workflow)
- **Language**: TypeScript
- **State Management**: Zustand v5 with AsyncStorage persistence
- **API Client**: Axios + TanStack React Query v5
- **Navigation**: Expo Router (file-based routing)
- **Charts**: react-native-gifted-charts
- **UI**: Custom CRED-inspired dark theme

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android) or Xcode (for iOS)

### Install Dependencies

```bash
npm install
```

### Run the App

This project uses native modules (`@react-native-community/datetimepicker`, `expo-linear-gradient`) and requires a **development build** (not Expo Go).

#### Android

```bash
npx expo run:android
```

#### iOS

```bash
npx expo run:ios
```

#### Start Metro (after initial build)

```bash
npx expo start --dev-client
```

## Features

- **Explore**: Browse and search 37,000+ mutual fund schemes with server-side pagination
- **Fund Details**: View scheme info, NAV chart with time range filters (1M/3M/6M/1Y/All), and full NAV history
- **Watchlist**: Bookmark funds and track their latest NAV
- **Holdings**: Record investments, compute current value and returns (handles non-trading days gracefully)
- **Offline**: Persisted watchlist/holdings available without network, auto-refreshes on foreground

## API

Uses the free public API at [mfapi.in](https://www.mfapi.in) — no authentication required.

- `GET /mf?limit=100&offset=0` — Paginated scheme list
- `GET /mf/search?q={query}` — Search by name
- `GET /mf/{schemeCode}` — Full NAV history
- `GET /mf/{schemeCode}/latest` — Latest NAV only

## Project Structure

```
src/
├── app/                    # Expo Router screens & layouts
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── services/               # API client (Axios) & React Query config
├── stores/                 # Zustand state management
├── types/                  # TypeScript interfaces
├── utils/                  # Pure utility functions
└── constants/              # Theme, colors, spacing
```
