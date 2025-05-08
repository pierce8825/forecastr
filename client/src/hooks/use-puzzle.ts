import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Assuming user context or state management provides the user ID
// For simplicity, we're using a hardcoded value
const USER_ID = 1;

export interface PuzzleIntegration {
  id: number;
  userId: number;
  apiKey?: string;
  workspaceId?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export function usePuzzle() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Query to get the integration status
  const { data: integration, isLoading } = useQuery({
    queryKey: ['/api/puzzle-integration', USER_ID],
    queryFn: async () => apiRequest(`/api/puzzle-integration/${USER_ID}`),
    refetchOnWindowFocus: false,
  });

  // Determine if the user is authorized
  const isAuthorized = !!integration;

  // Connect to Puzzle.io
  const connectMutation = useMutation({
    mutationFn: (data: { apiKey: string; workspaceId: string }) => {
      return apiRequest('/api/puzzle-integration', {
        method: 'POST',
        data: {
          userId: USER_ID,
          apiKey: data.apiKey,
          workspaceId: data.workspaceId,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/puzzle-integration', USER_ID] });
      toast({
        title: 'Connected Successfully',
        description: 'Your Puzzle.io account has been connected.',
        variant: 'default',
      });
      setIsConnecting(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to Puzzle.io. Please try again.',
        variant: 'destructive',
      });
      setIsConnecting(false);
    },
  });

  // Disconnect from Puzzle.io
  const disconnectMutation = useMutation({
    mutationFn: () => {
      return apiRequest(`/api/puzzle-integration/${USER_ID}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/puzzle-integration', USER_ID] });
      toast({
        title: 'Disconnected',
        description: 'Your Puzzle.io account has been disconnected.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Disconnection Failed',
        description: error.message || 'Failed to disconnect from Puzzle.io. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Connect to Puzzle.io
  const connectPuzzle = useCallback((apiKey: string, workspaceId: string) => {
    setIsConnecting(true);
    connectMutation.mutate({ apiKey, workspaceId });
  }, [connectMutation]);

  // Disconnect from Puzzle.io
  const disconnectPuzzle = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  return {
    isAuthorized,
    isConnecting,
    isLoading,
    integration,
    connectPuzzle,
    disconnectPuzzle,
  };
}