import { useState, useEffect, useCallback, useRef } from 'react';
import { FundDetail } from '../types/fund';
import { getFundDetail } from '../services/mf-api';

interface UseFundDetailResult {
  fund: FundDetail | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFundDetail(schemeCode: number): UseFundDetailResult {
  const [fund, setFund] = useState<FundDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  // Track whether the component is still mounted to avoid state updates after unmount
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getFundDetail(schemeCode);

        if (!cancelledRef.current) {
          setFund(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelledRef.current) {
          const message =
            err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(message);
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelledRef.current = true;
    };
  }, [schemeCode, retryCounter]);

  const retry = useCallback(() => {
    setRetryCounter((c) => c + 1);
  }, []);

  return { fund, isLoading, error, retry };
}
