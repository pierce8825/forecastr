import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface QuickbooksIntegration {
  userId: number;
  realmId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export function useQuickbooks(userId: number) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch integration status
  const {
    data: integration,
    isLoading,
    error,
  } = useQuery<QuickbooksIntegration | null>({
    queryKey: [`/api/quickbooks-integration/${userId}`],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      setIsRedirecting(true);
      const response = await fetch('/api/quickbooks/auth', {
        method: 'GET',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start QuickBooks authorization');
      }
      
      const { authUrl } = await response.json();
      window.location.href = authUrl;
      return null;
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/quickbooks-integration/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disconnect QuickBooks integration');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quickbooks-integration/${userId}`] });
    },
  });

  // Check if connected
  const isConnected = !!integration;

  // Connect to QuickBooks
  const connectQuickbooks = async () => {
    return connectMutation.mutateAsync();
  };

  // Disconnect from QuickBooks
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
    isRedirecting,
  };
}