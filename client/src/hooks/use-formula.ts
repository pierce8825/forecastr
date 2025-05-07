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

  // Validate a formula syntax
  const validateFormula = async (formula: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      // Try to parse the formula to check for syntax errors
      const isValid = formulaParser.validate(formula);
      return isValid;
    } catch (error) {
      return false;
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
    const isValid = await validateFormula(formulaData.formula);
    if (!isValid) {
      throw new Error("Invalid formula syntax");
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
