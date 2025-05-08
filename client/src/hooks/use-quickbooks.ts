import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Types for QuickBooks integration
interface QuickbooksIntegration {
  id: number;
  userId: number;
  accessToken: string | null;
  refreshToken: string | null;
  realmId: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to manage QuickBooks integration
 */
export function useQuickbooks(userId: number) {
  const queryClient = useQueryClient();

  // Get integration status
  const {
    data: integration,
    isLoading,
    error,
  } = useQuery<QuickbooksIntegration>({
    queryKey: ["/api/quickbooks-integration", userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/quickbooks-integration/${userId}`);
        if (res.status === 404) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch QuickBooks integration");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching QuickBooks integration:", error);
        return null;
      }
    },
  });

  // Connect to QuickBooks
  const connectMutation = useMutation({
    mutationFn: async () => {
      // We need to redirect the user to QuickBooks for authorization
      window.location.href = `/api/quickbooks/auth?userId=${userId}`;
      return null;
    },
  });

  // Disconnect from QuickBooks
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/quickbooks-integration/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quickbooks-integration"] });
    },
  });

  // Check if we have a valid integration
  const isConnected = !!integration?.accessToken;

  // Connect handler
  const connectQuickbooks = async () => {
    return connectMutation.mutateAsync();
  };

  // Disconnect handler
  const disconnectQuickbooks = async () => {
    return disconnectMutation.mutateAsync();
  };

  return {
    integration,
    isConnected,
    isLoading,
    error,
    connectQuickbooks,
    disconnectQuickbooks,
    isPending: connectMutation.isPending || disconnectMutation.isPending,
  };
}