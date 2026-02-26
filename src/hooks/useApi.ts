// Custom hook for API calls with loading, error, and retry logic
import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<{ data?: T; error?: string }>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(...args);

        if (result.error) {
          setError(result.error);
          if (options.onError) {
            options.onError(result.error);
          } else {
            toast({
              title: "Error",
              description: options.errorMessage || result.error,
              variant: "destructive",
            });
          }
          return { success: false, error: result.error };
        }

        if (result.data) {
          setData(result.data);
          if (options.onSuccess) {
            options.onSuccess(result.data);
          }
          if (options.successMessage) {
            toast({
              title: "Success",
              description: options.successMessage,
            });
          }
          return { success: true, data: result.data };
        }

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMsg);
        toast({
          title: "Error",
          description: options.errorMessage || errorMsg,
          variant: "destructive",
        });
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [apiCall, options, toast]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
