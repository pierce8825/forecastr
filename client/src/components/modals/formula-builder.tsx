import { useState } from "react";
import { useFormula } from "@/hooks/use-formula";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Parentheses } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormulaBuilderProps {
  forecastId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (formula: any) => void;
  variables?: { name: string; description?: string }[];
  initialFormula?: {
    id?: number;
    name: string;
    formula: string;
    description?: string;
    category?: string;
  };
}

const FormulaBuilder = ({
  forecastId,
  open,
  onOpenChange,
  onSave,
  variables = [],
  initialFormula,
}: FormulaBuilderProps) => {
  const [name, setName] = useState(initialFormula?.name || "");
  const [formula, setFormula] = useState(initialFormula?.formula || "");
  const [description, setDescription] = useState(initialFormula?.description || "");
  const [category, setCategory] = useState(initialFormula?.category || "");
  const { saveFormula, validateFormula, isValidating } = useFormula(forecastId);
  const { toast } = useToast();

  // Default variables if none are provided
  const defaultVariables = [
    { name: "Revenue", description: "Total revenue" },
    { name: "Expenses", description: "Total expenses" },
    { name: "User Count", description: "Number of users" },
    { name: "Conversion Rate", description: "User conversion rate" },
    { name: "ARPU", description: "Average revenue per user" },
    { name: "CAC", description: "Customer acquisition cost" },
  ];

  const availableVariables = variables.length > 0 ? variables : defaultVariables;

  const handleInsertVariable = (variable: string) => {
    setFormula(prev => {
      const cursorPosition = document.getElementById("formula-expression")?.selectionStart || prev.length;
      return prev.substring(0, cursorPosition) + variable + prev.substring(cursorPosition);
    });
    
    // Focus back on the formula input
    setTimeout(() => {
      const formulaInput = document.getElementById("formula-expression") as HTMLInputElement;
      if (formulaInput) {
        formulaInput.focus();
        formulaInput.selectionStart = formulaInput.selectionEnd = 
          (formulaInput.selectionStart || 0) + variable.length;
      }
    }, 0);
  };

  const handleSave = async () => {
    if (!name.trim() || !formula.trim()) {
      toast({
        title: "Validation Error",
        description: "Formula name and expression are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate the formula
      const isValid = await validateFormula(formula);
      
      if (!isValid) {
        toast({
          title: "Invalid Formula",
          description: "The formula expression is not valid",
          variant: "destructive",
        });
        return;
      }

      // Save the formula
      const savedFormula = await saveFormula({
        id: initialFormula?.id,
        name,
        formula,
        description,
        category,
      });

      if (onSave) {
        onSave(savedFormula);
      }

      toast({
        title: "Success",
        description: "Formula saved successfully",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save formula",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Formula Builder</DialogTitle>
          <DialogDescription>
            Create a custom formula to calculate and track key financial metrics.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="formula-name">Formula Name</Label>
            <Input
              id="formula-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Adjusted Revenue"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="formula-expression">Formula Expression</Label>
            <div className="flex rounded-md shadow-sm">
              <Input
                id="formula-expression"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Revenue * (1 - Discount Rate)"
                className="rounded-r-none"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-l-none border-l-0"
              >
                <Parentheses className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use operators like +, -, *, /, (, ) and variables from below
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label>Available Variables</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableVariables.map((variable, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  className="text-left justify-start font-normal h-auto py-2"
                  onClick={() => handleInsertVariable(variable.name)}
                >
                  {variable.name}
                  {variable.description && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({variable.description})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="formula-description">Description (Optional)</Label>
            <Input
              id="formula-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this formula calculates"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="formula-category">Category (Optional)</Label>
            <Input
              id="formula-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="E.g., Revenue, Metrics, KPI"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isValidating || !name.trim() || !formula.trim()}
          >
            {isValidating ? "Validating..." : "Save Formula"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaBuilder;
