import { FundDetail, FundSearchResult } from "../types/fund";
import { DEFAULT_CONFIG, fetchWithRetry } from "./api";

const BASE_URL = DEFAULT_CONFIG.baseURL;

const PAGE_SIZE = 100;

/**
 * Get a paginated list of mutual fund schemes.
 * API: GET https://api.mfapi.in/mf?limit={limit}&offset={offset}
 */
export async function getFundsPaginated(
  offset: number = 0,
  limit: number = PAGE_SIZE,
): Promise<FundSearchResult[]> {
  const url = `${BASE_URL}?limit=${limit}&offset=${offset}`;
  const results = await fetchWithRetry<FundSearchResult[]>(url);

  if (!Array.isArray(results)) {
    return [];
  }

  return results;
}

/**
 * Search for mutual fund schemes by name.
 * API: GET https://api.mfapi.in/mf/search?q={query}
 */
export async function searchFunds(query: string): Promise<FundSearchResult[]> {
  const encodedQuery = encodeURIComponent(query.trim());
  const url = `${BASE_URL}/search?q=${encodedQuery}`;

  const results = await fetchWithRetry<FundSearchResult[]>(url);

  if (!Array.isArray(results)) {
    return [];
  }

  return results;
}

/**
 * Get full fund details including NAV history.
 * API: GET https://api.mfapi.in/mf/{schemeCode}
 */
export async function getFundDetail(schemeCode: number): Promise<FundDetail> {
  const url = `${BASE_URL}/${schemeCode}`;
  const detail = await fetchWithRetry<FundDetail>(url);
  return detail;
}

/**
 * Get latest NAV for a fund.
 * API: GET https://api.mfapi.in/mf/{schemeCode}/latest
 */
export async function getLatestNAV(schemeCode: number): Promise<FundDetail> {
  const url = `${BASE_URL}/${schemeCode}/latest`;
  const detail = await fetchWithRetry<FundDetail>(url);
  return detail;
}

export { PAGE_SIZE };
