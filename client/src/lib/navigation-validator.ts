import { formulaBuildingService } from './formula-building-service';
import { useToast } from '@/hooks/use-toast';

/**
 * Validates all formulas in the application before allowing navigation
 * @returns True if all formulas are valid, false otherwise
 */
export function validateAllFormulas(): boolean {
  // Calculate all formulas and check for errors
  const validCalculation = formulaBuildingService.calculateAll();
  
  // Check for circular dependencies
  const hasCircularDependencies = formulaBuildingService.checkCircularDependencies();
  
  if (hasCircularDependencies) {
    const circularEntities = formulaBuildingService.getCircularEntities();
    const entityNames = circularEntities.map(e => e.name).join(', ');
    
    console.error('Circular dependencies detected in formulas:', entityNames);
    return false;
  }
  
  return validCalculation;
}

/**
 * Hook for validating navigation with formula checks
 * Use this before navigating to a new page
 */
export function useNavigationValidator() {
  const { toast } = useToast();
  
  /**
   * Validates formulas before allowing navigation
   * @param destinationPath The path to navigate to
   * @returns True if navigation should proceed, false if it should be blocked
   */
  const validateNavigation = (destinationPath: string): boolean => {
    // Skip validation for certain paths (auth, etc.)
    const excludedPaths = ['/auth', '/login', '/logout', '/settings'];
    if (excludedPaths.some(path => destinationPath.startsWith(path))) {
      return true;
    }
    
    const isValid = validateAllFormulas();
    
    if (!isValid) {
      toast({
        title: "Invalid Formulas Detected",
        description: "Please fix formula errors before navigating to another page.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  return { validateNavigation };
}