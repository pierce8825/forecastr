import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Workspace {
  id: number;
  name: string;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface FinancialContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  scenarios: Scenario[];
  activePeriod: string;
  isLoading: boolean;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setActiveScenario: (scenarioId: string) => void;
  setActivePeriod: (period: string) => void;
  refreshData: () => void;
}

const FinancialContext = createContext<FinancialContextType>({
  activeWorkspace: null,
  workspaces: [],
  scenarios: [],
  activePeriod: 'Monthly',
  isLoading: false,
  setActiveWorkspace: () => {},
  setActiveScenario: () => {},
  setActivePeriod: () => {},
  refreshData: () => {},
});

export const useFinancialContext = () => useContext(FinancialContext);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [activePeriod, setActivePeriod] = useState<string>('Monthly');
  
  // Demo workspaces
  const demoWorkspaces: Workspace[] = [
    { id: 1, name: 'Startup Growth Plan' }
  ];
  
  // Demo scenarios
  const demoScenarios: Scenario[] = [
    { id: 'base', name: 'Base Scenario', description: 'Current plan', isActive: true },
    { id: 'optimistic', name: 'Optimistic Growth', description: 'Product-market fit', isActive: false }
  ];
  
  // Fetch workspaces
  const { 
    data: workspacesData, 
    isLoading: isLoadingWorkspaces,
    refetch: refetchWorkspaces
  } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: true,
  });
  
  // Fetch scenarios for the active workspace
  const { 
    data: scenariosData, 
    isLoading: isLoadingScenarios,
    refetch: refetchScenarios
  } = useQuery({
    queryKey: ['/api/workspaces', activeWorkspace?.id, 'scenarios'],
    enabled: !!activeWorkspace,
  });
  
  // Set initial active workspace
  useEffect(() => {
    if (!activeWorkspace && workspacesData?.length > 0) {
      setActiveWorkspace(workspacesData[0]);
    } else if (!activeWorkspace && demoWorkspaces.length > 0) {
      setActiveWorkspace(demoWorkspaces[0]);
    }
  }, [workspacesData, activeWorkspace]);
  
  // Function to set active scenario
  const setActiveScenario = async (scenarioId: string) => {
    if (!activeWorkspace) return;
    
    try {
      // In a real app, we'd make an API request to update the active scenario
      // For demo purposes, we'll just update the state locally
      await apiRequest('POST', `/api/workspaces/${activeWorkspace.id}/scenarios/${scenarioId}/activate`, {});
      
      // Refresh scenarios
      refetchScenarios();
      
      toast({
        title: 'Scenario Updated',
        description: 'Active scenario has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update active scenario. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Function to refresh all data
  const refreshData = () => {
    refetchWorkspaces();
    refetchScenarios();
  };
  
  return (
    <FinancialContext.Provider 
      value={{
        activeWorkspace,
        workspaces: workspacesData || demoWorkspaces,
        scenarios: scenariosData || demoScenarios,
        activePeriod,
        isLoading: isLoadingWorkspaces || isLoadingScenarios,
        setActiveWorkspace,
        setActiveScenario,
        setActivePeriod,
        refreshData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};
