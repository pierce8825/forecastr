import { FormulaEntity, formulaParser } from './formula-parser';

export interface EntityValue {
  id: number;
  type: 'stream' | 'driver' | 'expense' | 'personnel';
  name: string;
  value: number;
  formula?: string | null;
  referenceName: string; // e.g., "stream_1", "driver_2"
}

/**
 * Service for managing formula building and calculations with circular dependency detection
 */
export class FormulaBuildingService {
  private entities: Map<string, EntityValue> = new Map();
  private calculatedValues: Map<string, number> = new Map();
  private calculationInProgress: Set<string> = new Set();
  private hasCircular: boolean = false;
  private circularEntities: EntityValue[] = [];

  /**
   * Add or update an entity in the registry
   */
  registerEntity(entity: EntityValue): void {
    const key = `${entity.type}_${entity.id}`;
    this.entities.set(key, entity);
    
    // Register with the formula parser for dependency tracking
    const formulaEntity: FormulaEntity = {
      id: entity.id,
      name: entity.name,
      formula: entity.formula,
      type: entity.type
    };
    formulaParser.registerEntity(formulaEntity);
  }

  /**
   * Remove an entity from the registry
   */
  unregisterEntity(type: string, id: number): void {
    const key = `${type}_${id}`;
    this.entities.delete(key);
    this.calculatedValues.delete(key);
  }

  /**
   * Get all registered entities
   */
  getAllEntities(): EntityValue[] {
    return Array.from(this.entities.values());
  }

  /**
   * Check for circular dependencies
   */
  checkCircularDependencies(): boolean {
    this.hasCircular = formulaParser.hasCircularDependencies();
    
    if (this.hasCircular) {
      const circularFormulas = formulaParser.getCircularDependencies();
      this.circularEntities = circularFormulas.map(formula => {
        const key = `${formula.type}_${formula.id}`;
        return this.entities.get(key) as EntityValue;
      });
    } else {
      this.circularEntities = [];
    }
    
    return this.hasCircular;
  }

  /**
   * Get entities involved in circular dependencies
   */
  getCircularEntities(): EntityValue[] {
    return this.circularEntities;
  }

  /**
   * Calculate all entity values, handling dependencies
   * Returns true if all calculations were successful
   */
  calculateAll(): boolean {
    // Clear previous calculation state
    this.calculatedValues.clear();
    this.calculationInProgress.clear();
    
    // Check for circular dependencies first
    if (this.checkCircularDependencies()) {
      return false;
    }
    
    // Calculate each entity
    let success = true;
    for (const [key, entity] of this.entities) {
      try {
        this.calculateEntity(entity);
      } catch (error) {
        console.error(`Error calculating ${entity.type} ${entity.id}:`, error);
        success = false;
      }
    }
    
    return success;
  }

  /**
   * Get the calculated value for an entity
   */
  getCalculatedValue(type: string, id: number): number | undefined {
    const key = `${type}_${id}`;
    return this.calculatedValues.get(key);
  }

  /**
   * Calculate a single entity's value, resolving dependencies
   */
  private calculateEntity(entity: EntityValue): number {
    const key = `${entity.type}_${entity.id}`;
    
    // If already calculated, return cached value
    if (this.calculatedValues.has(key)) {
      return this.calculatedValues.get(key) as number;
    }
    
    // Detect circular dependency
    if (this.calculationInProgress.has(key)) {
      throw new Error(`Circular dependency detected in ${entity.type} ${entity.id}`);
    }
    
    // Mark calculation in progress
    this.calculationInProgress.add(key);
    
    let value: number;
    
    // If entity has a formula, evaluate it
    if (entity.formula) {
      // Prepare variables for formula evaluation
      const variables: Record<string, number> = {};
      
      // Extract entity references from formula and resolve their values
      const regex = /(stream|driver|expense|personnel)_(\d+)/g;
      let match;
      
      while ((match = regex.exec(entity.formula)) !== null) {
        const dependencyType = match[1];
        const dependencyId = parseInt(match[2], 10);
        const dependencyKey = `${dependencyType}_${dependencyId}`;
        const referenceName = match[0]; // e.g., "stream_1"
        
        // Get the dependency entity
        const dependency = this.entities.get(dependencyKey);
        
        if (dependency) {
          // Calculate the dependency's value
          const dependencyValue = this.calculateEntity(dependency);
          variables[referenceName] = dependencyValue;
        } else {
          // If dependency not found, use a default value of 0
          variables[referenceName] = 0;
        }
      }
      
      // Add entity-specific variables if needed
      if (entity.type === 'personnel') {
        variables['headcount'] = entity.value;
      }
      
      // Evaluate the formula
      formulaParser.setVariables(variables);
      value = formulaParser.evaluate(entity.formula);
    } else {
      // If no formula, use the entity's direct value
      value = entity.value;
    }
    
    // Remove from in-progress and store calculated value
    this.calculationInProgress.delete(key);
    this.calculatedValues.set(key, value);
    
    return value;
  }
}

// Singleton instance for use throughout the application
export const formulaBuildingService = new FormulaBuildingService();