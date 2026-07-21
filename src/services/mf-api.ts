import { FundDetail, FundSearchResult } from "../types/fund";
import { apiClient } from "./api";

const PAGE_SIZE = 100;

/**
 * Get a paginated list of mutual fund schemes.
 */
export async function getFundsPaginated(
  offset: number = 0,
  limit: number = PAGE_SIZE,
): Promise<FundSearchResult[]> {
  const { data } = await apiClient.get<FundSearchResult[]>("", {
    params: { limit, offset },
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Search for mutual fund schemes by name.
 */
export async function searchFunds(query: string): Promise<FundSearchResult[]> {
  const { data } = await apiClient.get<FundSearchResult[]>("/search", {
    params: { q: query.trim() },
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Get full fund details including NAV history.
 */
export async function getFundDetail(schemeCode: number): Promise<FundDetail> {
  const { data } = await apiClient.get<FundDetail>(`/${schemeCode}`);
  return data;
}

/**
 * Get latest NAV for a fund.
 */
export async function getLatestNAV(schemeCode: number): Promise<FundDetail> {
  const { data } = await apiClient.get<FundDetail>(`/${schemeCode}/latest`);
  return data;
}

export { PAGE_SIZE };
