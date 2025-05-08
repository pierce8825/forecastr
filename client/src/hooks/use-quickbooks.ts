import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface QuickbooksIntegration {
  id: number;
  userId: number;
  accessToken: string;
  refreshToken: string;
  realmId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export const useQuickbooks = (userId = 1) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const { toast } = useToast();
  
  // Get integration data
  const { data: integration, isLoading } = useQuery<QuickbooksIntegration>({
    queryKey: ['/api/quickbooks-integration', userId],
    enabled: !!userId,
    retry: 1
  });

  const isAuthorized = !!integration;

  // Disconnect QuickBooks integration
  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest(`/api/quickbooks-integration/${userId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quickbooks-integration', userId] });
      toast({
        title: "Success",
        description: "QuickBooks account disconnected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect QuickBooks account",
        variant: "destructive",
      });
    }
  });

  // Authorize with QuickBooks
  const authorizeQuickbooks = useCallback(() => {
    setIsAuthorizing(true);
    
    // Open QuickBooks authorization window
    const authWindow = window.open('', '_blank', 'width=600,height=600');
    
    // Redirect to our backend authorization endpoint
    if (authWindow) {
      authWindow.location.href = `/api/quickbooks/auth`;
      
      // Poll for auth completion
      const checkInterval = setInterval(() => {
        try {
          // This will throw if cross-origin
          if (authWindow.closed) {
            clearInterval(checkInterval);
            setIsAuthorizing(false);
            
            // Refresh integration data
            queryClient.invalidateQueries({ queryKey: ['/api/quickbooks-integration', userId] });
            
            toast({
              title: "Success",
              description: "QuickBooks account connected successfully",
            });
          }
        } catch (e) {
          // Ignore cross-origin errors
        }
      }, 500);
    } else {
      setIsAuthorizing(false);
      toast({
        title: "Error",
        description: "Unable to open authorization window. Please disable popup blocker.",
        variant: "destructive",
      });
    }
  }, [queryClient, toast, userId]);

  // Disconnect QuickBooks
  const disconnectQuickbooks = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  return {
    isAuthorized,
    isAuthorizing,
    isLoading,
    integration,
    authorizeQuickbooks,
    disconnectQuickbooks
  };
};