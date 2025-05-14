import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, ChevronRight, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formulaParser } from '@/lib/formula-parser';
import { FormulaBuildingService, EntityValue, formulaBuildingService } from '@/lib/formula-building-service';

interface FormulaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formula: string, calculatedValue: number) => void;
  entityType: 'stream' | 'driver' | 'expense' | 'personnel';
  entityId: number;
  initialFormula?: string;
  streams?: any[];
  drivers?: any[];
  expenses?: any[];
  personnel?: any[];
}

export default function FormulaBuilder({
  isOpen,
  onClose,
  onSave,
  entityType,
  entityId,
  initialFormula = '',
  streams = [],
  drivers = [],
  expenses = [],
  personnel = []
}: FormulaBuilderProps) {
  const [formula, setFormula] = useState(initialFormula);
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("variables");
  const [variableSearch, setVariableSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityValue | null>(null);
  const [circularDependencies, setCircularDependencies] = useState<EntityValue[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Operators for formula building
  const operators = ['+', '-', '*', '/', '(', ')', '=', '>', '<', '>=', '<='];
  const functions = ['sum', 'min', 'max', 'avg', 'round', 'floor', 'ceil'];
  
  // Initialize service with entities
  useEffect(() => {
    formulaBuildingService.calculateAll();

    // Register all entities
    streams.forEach(stream => {
      formulaBuildingService.registerEntity({
        id: stream.id,
        type: 'stream',
        name: stream.name,
        value: Number(stream.amount) || 0,
        formula: stream.formula,
        referenceName: `stream_${stream.id}`
      });
    });
    
    drivers.forEach(driver => {
      formulaBuildingService.registerEntity({
        id: driver.id,
        type: 'driver',
        name: driver.name,
        value: Number(driver.value) || 0,
        formula: driver.formula,
        referenceName: `driver_${driver.id}`
      });
    });
    
    expenses.forEach(expense => {
      formulaBuildingService.registerEntity({
        id: expense.id,
        type: 'expense',
        name: expense.name,
        value: Number(expense.amount) || 0,
        formula: expense.formula,
        referenceName: `expense_${expense.id}`
      });
    });
    
    personnel.forEach(person => {
      formulaBuildingService.registerEntity({
        id: person.id,
        type: 'personnel',
        name: person.title,
        value: Number(person.count) || 0,
        formula: null,
        referenceName: `personnel_${person.id}`
      });
    });
    
    // Return cleanup function
    return () => {
      // Cleanup logic if needed
    };
  }, [streams, drivers, expenses, personnel]);
  
  // Try to calculate formula when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateFormula();
    }, 300); // Add debounce to avoid too many API calls
    
    return () => clearTimeout(timer);
  }, [formula]);
  
  // Calculate formula and check for circular dependencies
  const calculateFormula = async () => {
    if (!formula.trim()) {
      setCalculatedValue(null);
      setError(null);
      setWarning(null);
      setCircularDependencies([]);
      return;
    }
    
    // Set loading state
    setIsCalculating(true);
    
    try {
      // First perform client-side validation for quick feedback
      const validation = formulaParser.validateWithDetails(formula);
      if (!validation.isValid) {
        setError(validation.error?.message || "Invalid formula syntax");
        setCalculatedValue(null);
        setIsCalculating(false);
        return;
      }
      
      // Check for circular dependencies
      if (formulaBuildingService.checkCircularDependencies()) {
        const circular = formulaBuildingService.getCircularEntities();
        setCircularDependencies(circular);
        setWarning("Circular reference detected");
      } else {
        setCircularDependencies([]);
        setWarning(null);
      }
      
      // Prepare variables for calculation
      const variables: Record<string, number> = {};
      
      // Extract entity references
      const regex = /(stream|driver|expense|personnel)_(\d+)/g;
      let match;
      
      while ((match = regex.exec(formula)) !== null) {
        const type = match[1];
        const id = parseInt(match[2], 10);
        const referenceName = match[0];
        
        // Get entity value
        let value = 0;
        
        if (type === 'stream') {
          const stream = streams.find(s => s.id === id);
          value = stream ? Number(stream.amount) || 0 : 0;
        } else if (type === 'driver') {
          const driver = drivers.find(d => d.id === id);
          value = driver ? Number(driver.value) || 0 : 0;
        } else if (type === 'expense') {
          const expense = expenses.find(e => e.id === id);
          value = expense ? Number(expense.amount) || 0 : 0;
        } else if (type === 'personnel') {
          const person = personnel.find(p => p.id === id);
          value = person ? Number(person.count) || 0 : 0;
        }
        
        variables[referenceName] = value;
      }
      
      // Add common variables
      if (entityType === 'personnel') {
        const person = personnel.find(p => p.id === entityId);
        if (person) {
          variables['headcount'] = Number(person.count) || 0;
          variables['salary'] = Number(person.annualSalary) || 0;
        }
      }
      
      // Perform server-side validation and calculation
      try {
        const response = await fetch('/api/calculate-formula', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formula, variables }),
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.isValid) {
          setError(result.error?.message || "Server validation failed: Invalid formula");
          setCalculatedValue(null);
          return;
        }
        
        // Use the server-calculated result
        setCalculatedValue(result.result);
        setError(null);
      } catch (serverError) {
        // Fall back to client-side calculation if server request fails
        console.warn("Server calculation failed, falling back to client-side:", serverError);
        formulaParser.setVariables(variables);
        const result = formulaParser.evaluate(formula);
        setCalculatedValue(result);
        setError(null);
      }
    } catch (error) {
      console.error("Formula calculation error:", error);
      setError("Error calculating formula: " + (error instanceof Error ? error.message : String(error)));
      setCalculatedValue(null);
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Insert variable into formula
  const insertVariable = (variable: string) => {
    // Insert at cursor position or append to end
    const textArea = document.querySelector('[name="formula"]') as HTMLTextAreaElement | null;
    
    if (textArea) {
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;
      const textBefore = formula.substring(0, selectionStart);
      const textAfter = formula.substring(selectionEnd);
      
      const newFormula = textBefore + variable + textAfter;
      setFormula(newFormula);
      
      // Set focus back to textarea and move cursor after inserted variable
      setTimeout(() => {
        textArea.focus();
        const newPosition = selectionStart + variable.length;
        textArea.setSelectionRange(newPosition, newPosition);
      }, 10);
    } else {
      // No text area found, just append to formula
      setFormula((prevFormula) => prevFormula + variable);
    }
  };
  
  // Filter variables by search term
  const filterVariables = (items: any[], type: string) => {
    if (!variableSearch) return items;
    const lowerSearch = variableSearch.toLowerCase();
    return items.filter(item => 
      item.name?.toLowerCase().includes(lowerSearch) || 
      item.title?.toLowerCase().includes(lowerSearch)
    );
  };
  
  // Check if entity is the current one being edited (to prevent self-reference)
  const isSelf = (type: string, id: number) => {
    return type === entityType && id === entityId;
  };
  
  // Handle save
  const handleSave = () => {
    // Only allow saving if formula is valid (calculatedValue is not null)
    // and there are no errors
    if (calculatedValue !== null && error === null) {
      // If there's a warning (like circular dependencies), show a confirmation dialog
      if (warning) {
        if (!confirm(`Warning: ${warning}. Are you sure you want to save this formula?`)) {
          return;
        }
      }
      
      onSave(formula, calculatedValue);
      onClose();
    } else if (error) {
      // Show error message more prominently
      setError(`Cannot save: ${error}`);
    } else if (calculatedValue === null) {
      setError("Cannot save: Formula result is invalid");
    }
  };
  
  // Variable categories
  const variableCategories = [
    { id: 'streams', label: 'Revenue Streams', items: streams, type: 'stream' },
    { id: 'drivers', label: 'Revenue Drivers', items: drivers, type: 'driver' },
    { id: 'expenses', label: 'Expenses', items: expenses, type: 'expense' },
    { id: 'personnel', label: 'Personnel', items: personnel, type: 'personnel' },
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Formula Builder</DialogTitle>
          <DialogDescription>
            Create a formula by adding variables, operators, and functions
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-5 gap-4 flex-grow overflow-hidden">
          {/* Left panel: Variables and operators */}
          <div className="col-span-2 border rounded-md overflow-hidden flex flex-col">
            <Tabs defaultValue="variables" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="operators">Operators</TabsTrigger>
                <TabsTrigger value="functions">Functions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="variables" className="flex-grow flex flex-col overflow-hidden">
                <div className="p-2">
                  <Input 
                    placeholder="Search variables..." 
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="flex-grow">
                  <div className="p-2 space-y-4">
                    {variableCategories.map(category => (
                      <div key={category.id}>
                        <h3 className="font-medium mb-1">{category.label}</h3>
                        <div className="space-y-1">
                          {filterVariables(category.items, category.type).length > 0 ? (
                            filterVariables(category.items, category.type).map(item => {
                              const id = item.id;
                              const name = item.name || item.title;
                              const referenceName = `${category.type}_${id}`;
                              const isCurrentEntity = isSelf(category.type, id);
                              
                              return (
                                <div 
                                  key={referenceName}
                                  className={`flex items-center justify-between p-1 rounded hover:bg-muted ${isCurrentEntity ? 'opacity-50' : ''}`}
                                >
                                  <span className="text-sm truncate" title={name}>
                                    {name}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => insertVariable(referenceName)}
                                    disabled={isCurrentEntity}
                                    title={isCurrentEntity ? "Cannot reference self" : `Add ${name} to formula`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-sm text-muted-foreground p-1">
                              No {category.label.toLowerCase()} found
                            </div>
                          )}
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                    
                    {/* Common variables based on entity type */}
                    {entityType === 'personnel' && (
                      <div>
                        <h3 className="font-medium mb-1">Personnel Variables</h3>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between p-1 rounded hover:bg-muted">
                            <span className="text-sm">Headcount</span>
                            <Button variant="ghost" size="sm" onClick={() => insertVariable('headcount')}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-1 rounded hover:bg-muted">
                            <span className="text-sm">Annual Salary</span>
                            <Button variant="ghost" size="sm" onClick={() => insertVariable('salary')}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="operators" className="flex-grow overflow-auto">
                <div className="grid grid-cols-3 gap-2 p-4">
                  {operators.map(operator => (
                    <Button 
                      key={operator} 
                      variant="outline" 
                      className="h-12"
                      onClick={() => insertVariable(` ${operator} `)}
                    >
                      {operator}
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="functions" className="flex-grow overflow-auto">
                <div className="p-4 space-y-2">
                  {functions.map(func => (
                    <Button 
                      key={func} 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => insertVariable(`${func}()`)}
                    >
                      {func}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right panel: Formula editor and preview */}
          <div className="col-span-3 flex flex-col space-y-4">
            <div>
              <Label htmlFor="formula" className="text-muted-foreground text-sm">
                Formula
              </Label>
              <div className="mt-1">
                <Input
                  name="formula"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="font-mono"
                  placeholder="Build your formula..."
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use variables from the left panel, combined with operators and functions.
              </p>
            </div>
            
            {/* Preview */}
            <div className="flex-grow">
              <Label className="text-muted-foreground text-sm">Preview</Label>
              <div className="mt-1 p-4 border rounded-md h-[150px] overflow-auto bg-slate-50">
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : isCalculating ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                    <p className="text-sm text-muted-foreground">Validating formula...</p>
                  </div>
                ) : formula ? (
                  <div>
                    <div className="text-xl font-semibold">
                      {calculatedValue !== null ? `$${calculatedValue.toLocaleString()}` : 'Enter a valid formula'}
                    </div>
                    
                    {warning && (
                      <Alert className="mt-2 border-amber-500 bg-amber-50 text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>{warning}</AlertDescription>
                      </Alert>
                    )}
                    
                    {circularDependencies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-amber-600">Circular References Detected:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {circularDependencies.map((entity, index) => (
                            <Badge key={index} variant="outline" className="bg-amber-50">
                              {entity.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Enter a formula to see the preview
                  </div>
                )}
              </div>
            </div>
            
            {/* Referenced entities */}
            <div>
              <Label className="text-muted-foreground text-sm">Referenced Entities</Label>
              <div className="mt-1 border rounded-md p-2 min-h-[60px] max-h-[120px] overflow-auto bg-slate-50">
                {formula ? (
                  <div className="flex flex-wrap gap-2">
                    {/* Extract referenced entities from formula */}
                    {(formula.match(/(stream|driver|expense|personnel)_\d+/g) || []).map((ref, index) => {
                      const [type, id] = ref.split('_');
                      let entity;
                      
                      switch (type) {
                        case 'stream':
                          entity = streams.find(s => s.id === parseInt(id));
                          break;
                        case 'driver':
                          entity = drivers.find(d => d.id === parseInt(id));
                          break;
                        case 'expense':
                          entity = expenses.find(e => e.id === parseInt(id));
                          break;
                        case 'personnel':
                          entity = personnel.find(p => p.id === parseInt(id));
                          break;
                      }
                      
                      const name = entity ? (entity.name || entity.title) : 'Unknown';
                      
                      return (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="flex gap-1 items-center"
                          title={name}
                        >
                          {name}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setFormula(formula.replace(new RegExp(ref, 'g'), ''))}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm p-2">
                    No entities referenced
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={calculatedValue === null || error !== null || isCalculating}
            className={error ? "bg-red-100 hover:bg-red-200 text-red-800 hover:text-red-800" : ""}
            variant={error ? "outline" : "default"}
          >
            {isCalculating ? 'Validating...' : error ? 'Formula Has Errors' : warning ? 'Save Anyway' : 'Save Formula'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}