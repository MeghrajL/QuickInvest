import { useCallback, useEffect, useRef, useState } from "react";
import { searchFunds } from "../services/mf-api";
import { FundSearchResult } from "../types/fund";

interface UseSearchFundsResult {
  results: FundSearchResult[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useSearchFunds(query: string): UseSearchFundsResult {
  const [results, setResults] = useState<FundSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State-based counter to allow retry to re-trigger the effect
  const [retryCounter, setRetryCounter] = useState(0);

  // Ref to track the latest query for cancellation of stale responses
  const latestQueryRef = useRef(query);
  // Ref for the debounce timeout
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the latest query in the ref so async callbacks can check for staleness
  latestQueryRef.current = query;

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchFunds(searchQuery);

      // Only update state if this query is still the current one (cancellation)
      if (latestQueryRef.current === searchQuery) {
        setResults(data);
        setIsLoading(false);
      }
    } catch (err) {
      // Only update state if this query is still the current one (cancellation)
      if (latestQueryRef.current === searchQuery) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Clear any pending debounce timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Min 3 chars guard: reset results and don't search
    if (query.length < 3) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Debounce: wait 300ms before firing the search
    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    // Cleanup on unmount or when query/retryCounter changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [query, retryCounter, performSearch]);

  const retry = useCallback(() => {
    if (query.length >= 3) {
      // Increment retry counter to re-trigger the effect
      setRetryCounter((c) => c + 1);
    }
  }, [query]);

  return { results, isLoading, error, retry };
}
