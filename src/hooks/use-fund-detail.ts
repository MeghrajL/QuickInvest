import { useQuery } from "@tanstack/react-query";
import { getFundDetail } from "../services/mf-api";
import { FundDetail } from "../types/fund";

interface UseFundDetailResult {
  fund: FundDetail | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFundDetail(schemeCode: number): UseFundDetailResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["fundDetail", schemeCode],
    queryFn: () => getFundDetail(schemeCode),
    enabled: !!schemeCode,
  });

  return {
    fund: data ?? null,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "An unexpected error occurred"
      : null,
    retry: () => {
      refetch();
    },
  };
}
