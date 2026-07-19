import { FundSearchResult, FundDetail } from '../types/fund';
import { fetchWithRetry, DEFAULT_CONFIG } from './api';

const BASE_URL = DEFAULT_CONFIG.baseURL;

/**
 * Search for mutual fund schemes by name.
 * API: GET https://api.mfapi.in/mf/search?q={query}
 * Returns an array of {schemeCode, schemeName} results.
 */
export async function searchFunds(query: string): Promise<FundSearchResult[]> {
  const encodedQuery = encodeURIComponent(query.trim());
  const url = `${BASE_URL}/search?q=${encodedQuery}`;

  const results = await fetchWithRetry<FundSearchResult[]>(url);

  // Handle empty or non-array responses gracefully
  if (!Array.isArray(results)) {
    return [];
  }

  return results;
}

/**
 * Get full fund details including NAV history.
 * API: GET https://api.mfapi.in/mf/{schemeCode}
 * Returns fund metadata and NAV history (newest first).
 */
export async function getFundDetail(schemeCode: number): Promise<FundDetail> {
  const url = `${BASE_URL}/${schemeCode}`;

  const detail = await fetchWithRetry<FundDetail>(url);

  return detail;
}
