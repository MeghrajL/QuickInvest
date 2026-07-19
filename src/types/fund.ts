export interface FundSearchResult {
  schemeCode: number;
  schemeName: string;
}

export interface NAVEntry {
  date: string;       // "dd-MM-yyyy" format from API
  nav: string;        // String from API, parsed to number for display
}

export interface FundMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
}

export interface FundDetail {
  meta: FundMeta;
  data: NAVEntry[];   // Sorted newest first from API
}

export interface WatchlistItem {
  schemeCode: number;
  schemeName: string;
  latestNAV?: number;
  lastUpdated?: string;
  isStale?: boolean;
}

export interface HoldingRecord {
  id: string;          // UUID for unique identification
  schemeCode: number;
  fundName: string;
  units: number;
  purchaseDate: string; // ISO date string
  purchaseNAV?: number; // Resolved from NAV history
  currentNAV?: number;
  currentValue?: number;
  returnAmount?: number;
  returnPercentage?: number;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';
