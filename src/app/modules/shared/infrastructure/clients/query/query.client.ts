import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { ZodError } from "zod";

const MAX_RETRY_ATTEMPTS = 3;
const HTTP_CLIENT_ERROR_MIN = 400;
const HTTP_CLIENT_ERROR_MAX = 500;
const GC_TIME_MS = 0;

/**
 * Configuration for the React Query client.
 * Defines default behavior for mutations and queries including retry logic and caching.
 */
/**
 * Configuration object for the React Query client.
 *
 * Defines default behaviors for queries and mutations, including:
 * - Retry logic for failed mutations with intelligent error handling
 * - Garbage collection time for cached data
 * - Window focus refetch behavior
 *
 * @remarks
 * The retry logic automatically handles:
 * - Zod validation errors (no retry)
 * - HTTP 4xx client errors (no retry)
 * - Other errors (retry up to MAX_RETRY_ATTEMPTS)
 *
 * @see {@link QueryClientConfig} for the configuration type
 * @see {@link MAX_RETRY_ATTEMPTS} for the maximum number of retry attempts
 * @see {@link GC_TIME_MS} for the garbage collection time configuration
 */
export const QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    mutations: {
      /**
       * Centralized retry logic for mutations.
       * @param failureCount - Number of times the request has failed
       * @param error - The error that occurred
       * @returns Whether to retry the request
       */
      retry: (failureCount, error) => {
        if (error instanceof ZodError) return false;

        if (error instanceof HTTPError) {
          const status = error.response.status;
          if (status >= HTTP_CLIENT_ERROR_MIN && status < HTTP_CLIENT_ERROR_MAX)
            return false;
        }

        return failureCount < MAX_RETRY_ATTEMPTS;
      },
    },
    queries: {
      gcTime: GC_TIME_MS,
      refetchOnWindowFocus: false,
    },
  },
};

/**
 * Singleton instance of the React Query client.
 */
export const queryClient = new QueryClient(QUERY_CLIENT_CONFIG);
