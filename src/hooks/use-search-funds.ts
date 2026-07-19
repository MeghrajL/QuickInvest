import { useCallback, useEffect, useRef, useState } from "react";
import { getFundsPaginated, PAGE_SIZE, searchFunds } from "../services/mf-api";
import { FundSearchResult } from "../types/fund";

interface UseSearchFundsResult {
  results: FundSearchResult[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

export function useSearchFunds(query: string): UseSearchFundsResult {
  const [results, setResults] = useState<FundSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [retryCounter, setRetryCounter] = useState(0);

  const latestQueryRef = useRef(query);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);

  latestQueryRef.current = query;

  // Fetch initial page
  const fetchInitialPage = useCallback(async () => {
    offsetRef.current = 0;
    setIsLoading(true);
    setError(null);
    setHasMore(true);
    try {
      const data = await getFundsPaginated(0, PAGE_SIZE);
      setResults(data);
      offsetRef.current = data.length;
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load funds";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial page on mount
  useEffect(() => {
    if (query.length < 3) {
      fetchInitialPage();
    }
  }, [retryCounter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load next page (pagination)
  const loadMore = useCallback(async () => {
    if (query.length >= 3) return;
    if (loadingMoreRef.current || !hasMore) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const data = await getFundsPaginated(offsetRef.current, PAGE_SIZE);
      if (data.length > 0) {
        setResults((prev) => [...prev, ...data]);
        offsetRef.current += data.length;
        setHasMore(data.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // Silently fail — user can scroll again
    } finally {
      setIsLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [query, hasMore]);

  // Handle search with debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (query.length < 3) {
      return;
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(async () => {
      setError(null);
      try {
        const data = await searchFunds(query);
        if (latestQueryRef.current === query) {
          setResults(data);
          setHasMore(false);
          setIsLoading(false);
        }
      } catch (err) {
        if (latestQueryRef.current === query) {
          const message =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setError(message);
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [query]);

  // When query clears, reload default paginated list
  const prevQueryRef = useRef(query);
  useEffect(() => {
    if (prevQueryRef.current.length >= 3 && query.length < 3) {
      fetchInitialPage();
    }
    prevQueryRef.current = query;
  }, [query, fetchInitialPage]);

  const retry = useCallback(() => {
    setRetryCounter((c) => c + 1);
  }, []);

  return { results, isLoading, isLoadingMore, error, hasMore, loadMore, retry };
}
