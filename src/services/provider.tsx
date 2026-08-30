/**
 * React Query configuration and provider setup.
 */

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactNode } from "react";

// Create a client for server-state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutes default
    },
    mutations: {
      retry: 1
    }
  }
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Provider component for React Query.
 * Wrap the app or main layout with this to enable React Query hooks.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
