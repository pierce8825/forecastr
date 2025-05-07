import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickbooksConfig {
  clientId: string;
  redirectUri: string;
}

export function useQuickbooks(userId: number, config?: QuickbooksConfig) {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Default config
  const quickbooksConfig: QuickbooksConfig = config || {
    clientId: import.meta.env.VITE_QUICKBOOKS_CLIENT_ID || "demo-client-id",
    redirectUri: `${window.location.origin}/settings/quickbooks-callback`,
  };

  // Get integration status
  const { data: integration, isLoading } = useQuery({
    queryKey: ["/api/quickbooks-integration", userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/quickbooks-integration/${userId}`);
        if (res.status === 404) {
          return null; // Not connected
        }
        if (!res.ok) throw new Error("Failed to fetch QuickBooks integration");
        return res.json();
      } catch (error) {
        // If 404, just return null (not connected yet)
        if (error.message.includes("404")) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!userId,
  });

  // Save integration data
  const integrationMutation = useMutation({
    mutationFn: async (data: {
      accessToken: string;
      refreshToken: string;
      realmId: string;
      expiresAt: string;
    }) => {
      // Check if integration exists
      if (integration) {
        return await apiRequest("PUT", `/api/quickbooks-integration/${userId}`, data);
      } else {
        return await apiRequest("POST", "/api/quickbooks-integration", {
          ...data,
          userId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quickbooks-integration", userId] });
      toast({
        title: "Success",
        description: "QuickBooks integration connected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to connect QuickBooks: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/quickbooks-integration/${userId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quickbooks-integration", userId] });
      toast({
        title: "Success",
        description: "QuickBooks integration disconnected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to disconnect QuickBooks: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Initiate connection
  const connectQuickbooks = () => {
    if (!quickbooksConfig.clientId) {
      toast({
        title: "Configuration Error",
        description: "QuickBooks client ID is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    // In a real implementation, this would redirect to the QuickBooks authorization page
    // For demo purposes, we'll simulate a successful connection
    setTimeout(() => {
      const mockData = {
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
        realmId: "mock_realm_id",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      
      integrationMutation.mutate(mockData);
      setIsConnecting(false);
    }, 1500);
  };

  // Disconnect integration
  const disconnectQuickbooks = async () => {
    if (!integration) return;
    await deleteIntegrationMutation.mutateAsync();
  };

  // Check if the integration is connected and valid
  const isConnected = !!integration && new Date(integration.expiresAt) > new Date();

  // For handling OAuth callback
  const handleOAuthCallback = async (code: string, realmId: string) => {
    // In a real implementation, this would exchange the authorization code for tokens
    // For demo purposes, we'll simulate a successful response
    const mockData = {
      accessToken: "mock_access_token_from_callback",
      refreshToken: "mock_refresh_token_from_callback",
      realmId,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
    
    await integrationMutation.mutateAsync(mockData);
  };

  return {
    integration,
    isLoading,
    isConnected,
    isConnecting,
    connectQuickbooks,
    disconnectQuickbooks,
    handleOAuthCallback,
    isPending: integrationMutation.isPending || deleteIntegrationMutation.isPending,
  };
}
