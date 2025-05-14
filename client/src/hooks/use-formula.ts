import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formulaParser } from "@/lib/formula-parser";

export function useFormula(forecastId: number) {
  const [isValidating, setIsValidating] = useState(false);
  const queryClient = useQueryClient();

  // Get all formulas for a forecast
  const { data: formulas, isLoading } = useQuery({
    queryKey: ["/api/custom-formulas", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/custom-formulas?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch custom formulas");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Create or update a formula
  const formulaMutation = useMutation({
    mutationFn: async (formulaData: {
      id?: number;
      name: string;
      formula: string;
      description?: string;
      category?: string;
    }) => {
      // Add forecast ID to the data
      const data = {
        ...formulaData,
        forecastId,
      };

      // Create or update based on whether an ID is present
      if (formulaData.id) {
        return await apiRequest("PUT", `/api/custom-formulas/${formulaData.id}`, data);
      } else {
        return await apiRequest("POST", "/api/custom-formulas", data);
      }
    },
    onSuccess: () => {
      // Invalidate formula queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/custom-formulas"] });
    },
  });

  // Delete a formula
  const deleteFormulaMutation = useMutation({
    mutationFn: async (formulaId: number) => {
      return await apiRequest("DELETE", `/api/custom-formulas/${formulaId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-formulas"] });
    },
  });

  // Validate a formula syntax with detailed error information
  const validateFormula = async (formula: string): Promise<{isValid: boolean; error?: string}> => {
    setIsValidating(true);
    try {
      // First do client-side validation for quick feedback
      const clientValidation = formulaParser.validateWithDetails(formula);
      if (!clientValidation.isValid) {
        return {
          isValid: false,
          error: clientValidation.error?.message || 'Invalid formula syntax'
        };
      }
      
      // If client validation passes, do a more thorough server-side validation
      // Create variables object with basic placeholders for validation
      const variables: Record<string, number> = {};
      
      // Extract entity references from formula
      const regex = /(stream|driver|expense|personnel)_(\d+)/g;
      let match;
      while ((match = regex.exec(formula)) !== null) {
        const referenceName = match[0];
        variables[referenceName] = 1; // Use placeholder value for validation
      }
      
      // Call server to validate and calculate
      const response = await fetch('/api/calculate-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula, variables }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.isValid) {
        return {
          isValid: false,
          error: result.error?.message || 'Server validation failed: Invalid formula'
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    } finally {
      setIsValidating(false);
    }
  };

  // Save a formula (create or update)
  const saveFormula = async (formulaData: {
    id?: number;
    name: string;
    formula: string;
    description?: string;
    category?: string;
  }) => {
    // Validate formula before saving
    const validation = await validateFormula(formulaData.formula);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid formula syntax");
    }

    // Call the mutation
    return await formulaMutation.mutateAsync(formulaData);
  };

  // Delete a formula
  const deleteFormula = async (formulaId: number) => {
    return await deleteFormulaMutation.mutateAsync(formulaId);
  };

  return {
    formulas,
    isLoading,
    validateFormula,
    saveFormula,
    deleteFormula,
    isValidating,
    isPending: formulaMutation.isPending || deleteFormulaMutation.isPending,
  };
}
