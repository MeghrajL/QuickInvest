import { useQuery } from "@tanstack/react-query";
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
  const [paginatedResults, setPaginatedResults] = useState<FundSearchResult[]>(
    [],
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const isSearching = query.length >= 3;

  // React Query for initial page load
  const {
    data: initialData,
    isLoading: initialLoading,
    error: initialError,
    refetch: refetchInitial,
  } = useQuery({
    queryKey: ["funds", "list"],
    queryFn: () => getFundsPaginated(0, PAGE_SIZE),
    enabled: !isSearching,
  });

  // React Query for search
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["funds", "search", query],
    queryFn: () => searchFunds(query),
    enabled: isSearching,
  });

  // Sync initial data to paginated results
  useEffect(() => {
    if (!isSearching && initialData) {
      setPaginatedResults(initialData);
      offsetRef.current = initialData.length;
      setHasMore(initialData.length >= PAGE_SIZE);
    }
  }, [initialData, isSearching]);

  // Reset pagination when switching back from search
  const prevSearching = useRef(isSearching);
  useEffect(() => {
    if (prevSearching.current && !isSearching) {
      offsetRef.current = 0;
      setHasMore(true);
      refetchInitial();
    }
    prevSearching.current = isSearching;
  }, [isSearching, refetchInitial]);

  // Load more pages (manual pagination - React Query doesn't handle this natively for append)
  const loadMore = useCallback(async () => {
    if (isSearching) return;
    if (loadingMoreRef.current || !hasMore) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const data = await getFundsPaginated(offsetRef.current, PAGE_SIZE);
      if (data.length > 0) {
        setPaginatedResults((prev) => [...prev, ...data]);
        offsetRef.current += data.length;
        setHasMore(data.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [isSearching, hasMore]);

  const retry = useCallback(() => {
    if (isSearching) {
      refetchSearch();
    } else {
      refetchInitial();
    }
  }, [isSearching, refetchSearch, refetchInitial]);

  // Determine what to return
  const results = isSearching ? (searchData ?? []) : paginatedResults;
  const isLoading = isSearching ? searchLoading : initialLoading;
  const error = isSearching
    ? searchError instanceof Error
      ? searchError.message
      : searchError
        ? "Error"
        : null
    : initialError instanceof Error
      ? initialError.message
      : initialError
        ? "Error"
        : null;

  return { results, isLoading, isLoadingMore, error, hasMore, loadMore, retry };
}
