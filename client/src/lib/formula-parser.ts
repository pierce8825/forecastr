import * as math from 'mathjs';

export interface FormulaEntity {
  id: number;
  name: string;
  formula?: string | null;
  type: 'stream' | 'driver' | 'expense' | 'personnel';
}

export interface FormulaError {
  message: string;
  type: 'syntax' | 'circular' | 'reference' | 'calculation';
  details?: string;
  position?: number;
}

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
      const validation = this.validateWithDetails(formula);
      if (!validation.isValid) {
        throw new Error(validation.error?.message || 'Invalid formula');
      }
      
      const formulaWithValues = this.replaceVariablesWithValues(formula, this.variables);
      return math.evaluate(formulaWithValues);
    } catch (error) {
      throw new Error(`Error evaluating formula: ${error.message}`);
    }
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
