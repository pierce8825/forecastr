import { formulaBuildingService } from './formula-building-service';
import { formulaParser } from './formula-parser';

/**
 * Utility for debugging formula issues in the application
 * Run this when troubleshooting formula validation/calculation problems
 */
export function debugFormulas() {
  console.group('Formula Debugging');
  
  // Check for circular dependencies
  const hasCircular = formulaBuildingService.checkCircularDependencies();
  console.log('Circular dependencies detected:', hasCircular);
  
  if (hasCircular) {
    const entities = formulaBuildingService.getCircularEntities();
    console.log('Entities involved in circular dependencies:', entities);
  }
  
  // List all registered entities
  const allEntities = formulaBuildingService.getAllEntities();
  console.log('Registered entities:', allEntities.length);
  
  // Check for formula syntax errors
  const entitiesWithFormulas = allEntities.filter(e => e.formula);
  console.log('Entities with formulas:', entitiesWithFormulas.length);
  
  const invalidFormulas = entitiesWithFormulas.filter(e => {
    try {
      const validation = formulaParser.validateWithDetails(e.formula as string);
      return !validation.isValid;
    } catch (error) {
      return true;
    }
  });
  
  console.log('Entities with invalid formulas:', invalidFormulas);
  
  // Show validation details for invalid formulas
  invalidFormulas.forEach(entity => {
    console.group(`Invalid formula in ${entity.type} ${entity.id} (${entity.name})`);
    console.log('Formula:', entity.formula);
    
    try {
      const validation = formulaParser.validateWithDetails(entity.formula as string);
      console.log('Validation details:', validation);
    } catch (error) {
      console.log('Validation error:', error);
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
  
  return {
    hasCircularDependencies: hasCircular,
    invalidFormulas: invalidFormulas,
    totalEntities: allEntities.length,
    entitiesWithFormulas: entitiesWithFormulas.length
  };
}

/**
 * Check a single formula for validity and output debug information
 * @param formula The formula to debug
 * @param variables Optional variables to use during evaluation
 */
export function debugSingleFormula(formula: string, variables: Record<string, number> = {}) {
  console.group('Single Formula Debug');
  console.log('Formula:', formula);
  
  // Check syntax
  try {
    const validation = formulaParser.validateWithDetails(formula);
    console.log('Syntax validation:', validation);
    
    if (validation.isValid) {
      // Try evaluation
      formulaParser.setVariables(variables);
      const result = formulaParser.evaluate(formula);
      console.log('Evaluation result:', result);
    }
  } catch (error) {
    console.error('Error during validation/evaluation:', error);
  }
  
  // Extract referenced entities
  const regex = /(stream|driver|expense|personnel)_(\d+)/g;
  const references: {type: string, id: number}[] = [];
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    references.push({
      type: match[1],
      id: parseInt(match[2], 10)
    });
  }
  
  console.log('Referenced entities:', references);
  
  // Check if all referenced entities exist
  const missingEntities = references.filter(ref => {
    const key = `${ref.type}_${ref.id}`;
    const entity = formulaBuildingService.getAllEntities().find(e => 
      e.type === ref.type && e.id === ref.id
    );
    return !entity;
  });
  
  console.log('Missing entity references:', missingEntities);
  
  console.groupEnd();
  
  return {
    formula,
    referencedEntities: references,
    missingEntities: missingEntities
  };
}