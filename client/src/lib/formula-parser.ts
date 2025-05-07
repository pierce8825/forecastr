import * as math from 'mathjs';

export class FormulaParser {
  private variables: Record<string, number> = {};

  /**
   * Set variables to be used in formula evaluation
   * @param variables Object containing variable names and their values
   */
  setVariables(variables: Record<string, number>): void {
    this.variables = variables;
  }

  /**
   * Add or update a single variable
   * @param name Variable name
   * @param value Variable value
   */
  setVariable(name: string, value: number): void {
    this.variables[name] = value;
  }

  /**
   * Validate a formula without evaluating it
   * @param formula The formula to validate
   * @returns True if the formula is valid, false otherwise
   */
  validate(formula: string): boolean {
    try {
      // Replace variable names with 1 to check syntax
      const testFormula = this.replaceVariablesWithValues(formula, {});
      math.evaluate(testFormula);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Evaluate a formula with current variables
   * @param formula The formula to evaluate
   * @returns The formula result
   */
  evaluate(formula: string): number {
    try {
      const formulaWithValues = this.replaceVariablesWithValues(formula, this.variables);
      return math.evaluate(formulaWithValues);
    } catch (error) {
      throw new Error(`Error evaluating formula: ${error.message}`);
    }
  }

  /**
   * Get all variable names used in a formula
   * @param formula The formula to parse
   * @returns Array of variable names
   */
  extractVariables(formula: string): string[] {
    // This is a simplified approach that looks for words in the formula
    // A more robust approach would parse the formula properly
    const variableRegex = /[A-Za-z][A-Za-z0-9_\s]*/g;
    const mathJsKeywords = new Set([
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'log', 'exp', 'pow', 'abs'
    ]);
    
    const matches = formula.match(variableRegex) || [];
    return matches
      .map(match => match.trim())
      .filter(match => !mathJsKeywords.has(match.toLowerCase()) && match !== '');
  }

  /**
   * Replace variable names in a formula with their values
   * @param formula The formula with variable names
   * @param variables Object mapping variable names to values
   * @returns Formula with variables replaced by values
   */
  private replaceVariablesWithValues(formula: string, variables: Record<string, number>): string {
    let result = formula;
    
    // Get all potential variables in the formula
    const potentialVariables = this.extractVariables(formula);
    
    // Sort by length (descending) to replace longer names first
    // This prevents issues where one variable name is a substring of another
    potentialVariables.sort((a, b) => b.length - a.length);
    
    for (const varName of potentialVariables) {
      // Create a regex that matches the variable name as a whole word
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      
      // If variable exists in our variables object, replace with its value
      // Otherwise use 1 for validation purposes
      const value = variables[varName] !== undefined ? variables[varName] : 1;
      result = result.replace(regex, value.toString());
    }
    
    return result;
  }
}

// Singleton instance for use throughout the application
export const formulaParser = new FormulaParser();

// Helper function to calculate formula with given variables
export async function calculateFormula(formula: string, variables: Record<string, number>): Promise<number> {
  try {
    // For server-side calculation, make an API call
    const response = await fetch('/api/calculate-formula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formula, variables }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate formula');
    }
    
    const result = await response.json();
    return result.result;
  } catch (error) {
    // Fall back to client-side calculation
    const parser = new FormulaParser();
    parser.setVariables(variables);
    return parser.evaluate(formula);
  }
}
