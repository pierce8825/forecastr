import * as math from 'mathjs';

/**
 * Types for the formula parser
 */
export interface FormulaVariable {
  name: string;
  value: number;
}

/**
 * Evaluates a formula string with the given variable values
 * @param formula The formula string to evaluate
 * @param variables Object with variable names as keys and their values
 * @returns The result of the formula evaluation
 */
export function evaluate(formula: string, variables: Record<string, number>): number {
  try {
    // Replace variable references with their values
    const processedFormula = processFormula(formula, variables);
    
    // Use mathjs to safely evaluate the formula
    const result = math.evaluate(processedFormula);
    
    // Return the result, ensuring it's a number
    return typeof result === 'number' ? result : 0;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return 0;
  }
}

/**
 * Process a formula by replacing variable references with their values
 * @param formula The formula string with variable references like [VariableName]
 * @param variables Object with variable names as keys and their values
 * @returns Processed formula string ready for evaluation
 */
function processFormula(formula: string, variables: Record<string, number>): string {
  // Replace all instances of [VariableName] with their numeric values
  return formula.replace(/\[([^\]]+)\]/g, (match, variableName) => {
    const value = variables[variableName];
    if (value === undefined) {
      throw new Error(`Variable "${variableName}" not found`);
    }
    return value.toString();
  });
}

/**
 * Extracts variable names from a formula
 * @param formula The formula string containing variable references like [VariableName]
 * @returns Array of variable names used in the formula
 */
export function extractVariables(formula: string): string[] {
  const matches = formula.match(/\[([^\]]+)\]/g) || [];
  return matches.map(match => match.slice(1, -1));
}

/**
 * Validates a formula for syntax errors
 * @param formula The formula to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateFormula(formula: string): { isValid: boolean; error?: string } {
  try {
    // Extract variable names
    const variableNames = extractVariables(formula);
    
    // Create a temporary object with placeholders for variables
    const mockVariables: Record<string, number> = {};
    variableNames.forEach(name => {
      mockVariables[name] = 1; // Use 1 as a safe value for testing
    });
    
    // Try to evaluate the formula with placeholder values
    const processedFormula = processFormula(formula, mockVariables);
    math.evaluate(processedFormula);
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown error validating formula' 
    };
  }
}

/**
 * Formats a formula by highlighting variable references
 * @param formula The formula string to format
 * @returns HTML-safe string with styled variable references
 */
export function formatFormula(formula: string): string {
  return formula.replace(/\[([^\]]+)\]/g, '<span class="text-primary">[$1]</span>');
}

/**
 * Calculate the numeric result of a CAC formula
 * @param marketingCost Total marketing cost
 * @param newCustomers Number of new customers
 * @returns The CAC value
 */
export function calculateCAC(marketingCost: number, newCustomers: number): number {
  if (newCustomers <= 0) return 0;
  return marketingCost / newCustomers;
}

/**
 * Calculate the numeric result of an LTV formula
 * @param averageRevenue Average monthly revenue per customer
 * @param churnRate Monthly churn rate as a decimal
 * @returns The LTV value
 */
export function calculateLTV(averageRevenue: number, churnRate: number): number {
  if (churnRate <= 0 || churnRate >= 1) return 0;
  return averageRevenue / churnRate;
}

/**
 * Calculate the numeric result of an LTV:CAC ratio
 * @param ltv Lifetime Value
 * @param cac Customer Acquisition Cost
 * @returns The LTV:CAC ratio
 */
export function calculateLTVtoCAC(ltv: number, cac: number): number {
  if (cac <= 0) return 0;
  return ltv / cac;
}
