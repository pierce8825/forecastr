import * as math from 'mathjs';

export interface FormulaEntity {
  id: number;
  name: string;
  formula?: string | null;
  type: 'stream' | 'driver' | 'expense' | 'personnel';
}

export interface FormulaError {
  message: string;
  type: 'syntax' | 'circular' | 'reference' | 'calculation' | 'domain';
  details?: string;
  position?: number;
  suggestion?: string; // Suggested fix for the error
}

// Available financial and statistical functions with descriptions
export const availableFunctions = {
  // Basic operations
  add: { description: 'Addition: add(a, b, ...)', example: 'add(10, 20)' },
  subtract: { description: 'Subtraction: subtract(a, b)', example: 'subtract(20, 10)' },
  multiply: { description: 'Multiplication: multiply(a, b, ...)', example: 'multiply(5, 4)' },
  divide: { description: 'Division: divide(a, b)', example: 'divide(20, 4)' },
  
  // Financial functions
  pmt: { description: 'Calculate the payment for a loan: pmt(rate, nper, pv)', example: 'pmt(0.05/12, 60, 10000)' },
  fv: { description: 'Future value: fv(rate, nper, pmt, [pv])', example: 'fv(0.05/12, 60, -200, 10000)' },
  pv: { description: 'Present value: pv(rate, nper, pmt, [fv])', example: 'pv(0.05/12, 60, -200)' },
  npv: { description: 'Net present value: npv(rate, values)', example: 'npv(0.1, [100, 200, 300])' },
  irr: { description: 'Internal rate of return: irr(values)', example: 'irr([-100, 50, 70])' },
  
  // Statistical functions
  mean: { description: 'Mean/average of values: mean(a, b, ...)', example: 'mean(10, 20, 30, 40)' },
  median: { description: 'Median of values: median(a, b, ...)', example: 'median(10, 20, 30, 40)' },
  std: { description: 'Standard deviation: std(a, b, ...)', example: 'std(10, 20, 30, 40)' },
  min: { description: 'Minimum value: min(a, b, ...)', example: 'min(10, 20, 5, 40)' },
  max: { description: 'Maximum value: max(a, b, ...)', example: 'max(10, 20, 30, 40)' },
  
  // Mathematical functions
  pow: { description: 'Power: pow(base, exponent)', example: 'pow(2, 3)' },
  sqrt: { description: 'Square root: sqrt(value)', example: 'sqrt(16)' },
  log: { description: 'Natural logarithm: log(value)', example: 'log(10)' },
  log10: { description: 'Base-10 logarithm: log10(value)', example: 'log10(100)' },
  exp: { description: 'Exponential: exp(value)', example: 'exp(2)' },
  abs: { description: 'Absolute value: abs(value)', example: 'abs(-5)' },
  
  // Rounding functions
  round: { description: 'Round to nearest integer: round(value)', example: 'round(3.7)' },
  ceil: { description: 'Round up: ceil(value)', example: 'ceil(3.2)' },
  floor: { description: 'Round down: floor(value)', example: 'floor(3.8)' },
  
  // Trigonometric functions
  sin: { description: 'Sine: sin(value)', example: 'sin(0.5)' },
  cos: { description: 'Cosine: cos(value)', example: 'cos(0.5)' },
  tan: { description: 'Tangent: tan(value)', example: 'tan(0.5)' },
  
  // Business-specific functions
  cagr: { description: 'Compound Annual Growth Rate: cagr(beginValue, endValue, years)', example: 'cagr(100, 200, 5)' },
  markup: { description: 'Markup percentage: markup(cost, price)', example: 'markup(80, 100)' },
  margin: { description: 'Profit margin: margin(revenue, cost)', example: 'margin(100, 70)' },
  annualToMonthly: { description: 'Convert annual rate to monthly: annualToMonthly(annualRate)', example: 'annualToMonthly(0.12)' },
  depreciation: { description: 'Calculate depreciation: depreciation(cost, salvageValue, lifeYears)', example: 'depreciation(10000, 1000, 5)' },
  compound: { description: 'Compound interest: compound(principal, rate, times, years)', example: 'compound(1000, 0.05, 12, 5)' },
  roi: { description: 'Return on Investment: roi(gain, cost)', example: 'roi(1200, 1000)' },
  breakEven: { description: 'Break-even point: breakEven(fixedCosts, unitPrice, unitVariableCost)', example: 'breakEven(10000, 100, 60)' },
  ltv: { description: 'Customer Lifetime Value: ltv(avgMonthlyRevenue, grossMargin, churnRate)', example: 'ltv(100, 0.7, 0.05)' },
  roundTo: { description: 'Round to decimal places: roundTo(value, decimals)', example: 'roundTo(123.456, 2)' }
};

export class FormulaParser {
  private variables: Record<string, number> = {};
  private entityMap: Map<string, FormulaEntity> = new Map();
  private dependencyGraph: Map<number, Set<number>> = new Map();
  private calculationStack: Set<number> = new Set();

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
   * Register an entity for dependency tracking
   * @param entity The entity to register
   */
  registerEntity(entity: FormulaEntity): void {
    const key = `${entity.type}_${entity.id}`;
    this.entityMap.set(key, entity);
    
    // Initialize dependency graph entry if it doesn't exist
    if (!this.dependencyGraph.has(entity.id)) {
      this.dependencyGraph.set(entity.id, new Set());
    }
    
    // If this entity has a formula, update the dependency graph
    if (entity.formula) {
      const dependencies = this.extractEntityReferences(entity.formula);
      dependencies.forEach(depId => {
        this.dependencyGraph.get(entity.id)?.add(depId);
      });
    }
  }

  /**
   * Clear all registered entities and dependencies
   */
  clearEntities(): void {
    this.entityMap.clear();
    this.dependencyGraph.clear();
  }

  /**
   * Check if there are circular dependencies in the registered entities
   * @returns True if circular dependencies are detected, false otherwise
   */
  hasCircularDependencies(): boolean {
    // For each entity, try to do a DFS traversal to see if we find a cycle
    for (const [entityId] of this.dependencyGraph) {
      this.calculationStack.clear();
      if (this.detectCircularDependency(entityId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the entities involved in circular dependencies, if any
   * @returns Array of entities involved in circular dependencies, or empty array
   */
  getCircularDependencies(): FormulaEntity[] {
    const circularEntities: FormulaEntity[] = [];
    
    // For each entity, try to do a DFS traversal to see if we find a cycle
    for (const [entityId] of this.dependencyGraph) {
      this.calculationStack.clear();
      if (this.detectCircularDependency(entityId)) {
        // Add all entities in the current calculation stack
        this.calculationStack.forEach(id => {
          for (const [key, entity] of this.entityMap) {
            if (entity.id === id) {
              circularEntities.push(entity);
            }
          }
        });
        break;
      }
    }
    
    return circularEntities;
  }

  /**
   * Helper for circular dependency detection
   * @param entityId The ID of the entity to check
   * @returns True if a circular dependency is detected, false otherwise
   */
  private detectCircularDependency(entityId: number): boolean {
    // If we've already seen this entity in current calculation path, there's a cycle
    if (this.calculationStack.has(entityId)) {
      return true;
    }
    
    // Add this entity to calculation stack
    this.calculationStack.add(entityId);
    
    // Check all dependencies
    const dependencies = this.dependencyGraph.get(entityId);
    if (dependencies) {
      for (const depId of dependencies) {
        if (this.detectCircularDependency(depId)) {
          return true;
        }
      }
    }
    
    // Remove from stack as we exit this branch
    this.calculationStack.delete(entityId);
    
    return false;
  }

  /**
   * Extract entity references from a formula (e.g., "stream_1", "driver_2")
   * @param formula The formula to analyze
   * @returns Array of entity IDs referenced in the formula
   */
  private extractEntityReferences(formula: string): number[] {
    const entityRefs: number[] = [];
    
    // Match patterns like "stream_123", "driver_45", etc.
    const refRegex = /(stream|driver|expense|personnel)_(\d+)/g;
    let match;
    
    while ((match = refRegex.exec(formula)) !== null) {
      const entityId = parseInt(match[2], 10);
      if (!isNaN(entityId)) {
        entityRefs.push(entityId);
      }
    }
    
    return entityRefs;
  }

  /**
   * Validate a formula without evaluating it
   * @param formula The formula to validate
   * @returns Object with validation result and error information if invalid
   */
  validateWithDetails(formula: string): { isValid: boolean; error?: FormulaError } {
    try {
      // Check for empty formula
      if (!formula.trim()) {
        return { 
          isValid: false, 
          error: {
            message: 'Formula cannot be empty',
            type: 'syntax'
          }
        };
      }
      
      // Check for balanced parentheses
      const openParens = (formula.match(/\(/g) || []).length;
      const closeParens = (formula.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        return { 
          isValid: false, 
          error: {
            message: 'Unbalanced parentheses',
            type: 'syntax',
            details: `Found ${openParens} opening parentheses and ${closeParens} closing parentheses`
          }
        };
      }

      // Check for invalid references
      const refRegex = /(stream|driver|expense|personnel)_(\d+)/g;
      let match;
      while ((match = refRegex.exec(formula)) !== null) {
        const type = match[1];
        const id = parseInt(match[2], 10);
        const key = `${type}_${id}`;
        
        if (!this.entityMap.has(key)) {
          return { 
            isValid: false, 
            error: {
              message: `Invalid reference: ${key}`,
              type: 'reference',
              details: `The referenced ${type} with ID ${id} does not exist`,
              position: match.index
            }
          };
        }
      }
      
      // Replace variable names with 1 to check syntax
      const testFormula = this.replaceVariablesWithValues(formula, {});
      math.evaluate(testFormula);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: {
          message: 'Syntax error in formula',
          type: 'syntax',
          details: error.message
        }
      };
    }
  }
  
  /**
   * Simple validation that returns just a boolean
   * @param formula The formula to validate
   * @returns True if the formula is valid, false otherwise
   */
  validate(formula: string): boolean {
    return this.validateWithDetails(formula).isValid;
  }

  /**
   * Evaluate a formula with current variables
   * @param formula The formula to evaluate
   * @returns The formula result
   */
  evaluate(formula: string): number {
    try {
      // First run validation
      const validation = this.validateWithDetails(formula);
      if (!validation.isValid) {
        throw new Error(validation.error?.message || 'Invalid formula');
      }
      
      // Register custom business-specific functions
      const customFunctions = this.registerCustomFunctions();
      
      // Replace variables and evaluate
      const formulaWithValues = this.replaceVariablesWithValues(formula, this.variables);
      
      // Run the evaluation with custom scope that includes our functions
      const result = math.evaluate(formulaWithValues, customFunctions);
      
      // Check if result is a valid number
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Formula did not evaluate to a valid number');
      }
      
      return result;
    } catch (error) {
      // Provide more descriptive error messages based on error type
      if (error.message.includes('undefined variable')) {
        const varName = error.message.match(/undefined variable (\w+)/)?.[1];
        throw new Error(`Undefined variable: ${varName}. Make sure all variables are defined.`);
      } else if (error.message.includes('unexpected end of expression')) {
        throw new Error('Unexpected end of expression. Check for incomplete formulas or missing closing parentheses.');
      } else if (error.message.includes('value must be a number')) {
        throw new Error('Invalid value in calculation. All operands must be numeric.');
      } else if (error.message.includes('division by zero')) {
        throw new Error('Division by zero is not allowed.');
      } else if (error.message.includes('function') && error.message.includes('not found')) {
        const funcName = error.message.match(/function '?(\w+)'? not found/)?.[1];
        const similarFunctions = Object.keys(availableFunctions)
          .filter(f => f.includes(funcName || '') || funcName?.includes(f))
          .slice(0, 3);
        
        const suggestion = similarFunctions.length > 0 
          ? `Did you mean: ${similarFunctions.join(', ')}?` 
          : 'Check function names and spelling.';
          
        throw new Error(`Unknown function: ${funcName}. ${suggestion}`);
      } else {
        throw new Error(`Error evaluating formula: ${error.message}`);
      }
    }
  }
  
  /**
   * Register custom business and financial functions
   * @returns Object with custom function definitions
   */
  private registerCustomFunctions(): Record<string, Function> {
    return {
      // CAGR (Compound Annual Growth Rate)
      cagr: function(beginValue: number, endValue: number, years: number): number {
        if (beginValue <= 0 || years <= 0) {
          throw new Error('CAGR calculation requires positive begin value and years');
        }
        return Math.pow(endValue / beginValue, 1 / years) - 1;
      },
      
      // Calculate markup percentage
      markup: function(cost: number, price: number): number {
        if (cost <= 0) {
          throw new Error('Markup calculation requires positive cost');
        }
        return (price - cost) / cost;
      },
      
      // Calculate profit margin
      margin: function(revenue: number, cost: number): number {
        if (revenue <= 0) {
          throw new Error('Margin calculation requires positive revenue');
        }
        return (revenue - cost) / revenue;
      },
      
      // Convert annual to monthly rate
      annualToMonthly: function(annualRate: number): number {
        return Math.pow(1 + annualRate, 1/12) - 1;
      },
      
      // Calculate depreciation
      depreciation: function(cost: number, salvageValue: number, lifeYears: number): number {
        return (cost - salvageValue) / lifeYears;
      },
      
      // Calculate compound interest
      compound: function(principal: number, rate: number, times: number, years: number): number {
        return principal * Math.pow(1 + rate/times, times * years);
      },
      
      // Calculate Return on Investment (ROI)
      roi: function(gain: number, cost: number): number {
        if (cost === 0) throw new Error('ROI calculation requires non-zero cost');
        return gain / cost;
      },
      
      // Calculate break-even point
      breakEven: function(fixedCosts: number, unitPrice: number, unitVariableCost: number): number {
        if (unitPrice <= unitVariableCost) {
          throw new Error('Break-even calculation requires price greater than variable cost');
        }
        return fixedCosts / (unitPrice - unitVariableCost);
      },
      
      // Calculate Lifetime Value (LTV)
      ltv: function(avgMonthlyRevenue: number, grossMargin: number, churnRate: number): number {
        if (churnRate <= 0 || churnRate >= 1) {
          throw new Error('Churn rate must be between 0 and 1');
        }
        return (avgMonthlyRevenue * grossMargin) / churnRate;
      },
      
      // Round to specific number of decimal places
      roundTo: function(value: number, decimals: number): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
      }
    };
  }
  
  /**
   * Format a formula to make it more readable
   * @param formula The formula to format
   * @returns The formatted formula
   */
  formatFormula(formula: string): string {
    try {
      // Replace operators with spaces around them
      let formatted = formula
        .replace(/([+\-*\/=><])/g, ' $1 ')   // Add spaces around operators
        .replace(/\s+/g, ' ')               // Normalize spaces
        .replace(/\( /g, '(')               // Remove space after opening parenthesis
        .replace(/ \)/g, ')')               // Remove space before closing parenthesis
        .trim();
        
      return formatted;
    } catch {
      // If any error occurs, return the original formula
      return formula;
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
    // Include all math.js functions and our custom business functions
    const mathJsKeywords = new Set([
      // Basic math.js functions
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'log', 'log10', 'exp', 'pow', 'abs',
      'round', 'floor', 'ceil', 'min', 'max', 'mean', 'median', 'std', 'sum',
      // Financial and business functions
      'pmt', 'fv', 'pv', 'npv', 'irr', 'cagr', 'markup', 'margin',
      // Custom functions
      'annualToMonthly', 'depreciation', 'compound', 'roi', 'breakEven', 'ltv', 'roundTo'
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
