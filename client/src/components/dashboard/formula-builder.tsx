import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { evaluate } from "@/lib/formula-parser";

export interface FormulaVariable {
  id: string;
  name: string;
  description: string;
}

interface FormulaBuilderProps {
  formula: {
    id?: string;
    name: string;
    formula: string;
    result?: {
      value: string;
      change?: {
        value: string;
        type: "positive" | "negative" | "neutral";
      };
      description?: string;
      period?: string;
    };
  };
  availableVariables: FormulaVariable[];
  isLoading?: boolean;
  onSave?: (formula: { name: string; formula: string }) => void;
  onMoreOptions?: () => void;
  onFormulaChange?: (formula: string) => void;
  onNameChange?: (name: string) => void;
  onVariableClick?: (variable: FormulaVariable) => void;
}

export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  availableVariables,
  isLoading = false,
  onSave,
  onMoreOptions,
  onFormulaChange,
  onNameChange,
  onVariableClick,
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-neutral-darker">Formula Builder</h3>
            <div className="flex items-center space-x-3">
              <Button variant="link" size="sm" disabled>Save</Button>
              <button className="text-neutral-dark p-1" disabled>
                <MaterialIcon name="more_horiz" />
              </button>
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-neutral-lighter rounded"></div>
            <div className="h-24 bg-neutral-lighter rounded"></div>
            <div className="h-10 bg-neutral-lighter rounded"></div>
            <div className="h-24 bg-neutral-lighter rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-neutral-darker">Formula Builder</h3>
          <div className="flex items-center space-x-3">
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary font-medium"
              onClick={() => onSave && onSave({ name: formula.name, formula: formula.formula })}
            >
              Save
            </Button>
            <button 
              className="text-neutral-dark hover:text-primary p-1"
              onClick={onMoreOptions}
            >
              <MaterialIcon name="more_horiz" />
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-darker mb-2">Formula Name</label>
          <Input 
            type="text" 
            className="border-neutral-light"
            placeholder="Sales Growth Rate" 
            value={formula.name}
            onChange={(e) => onNameChange && onNameChange(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-darker mb-2">Formula</label>
          <div 
            className="formula-editor w-full bg-neutral-lighter px-3 py-2 border border-neutral-light rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary text-sm text-neutral-darker h-24"
            contentEditable
            suppressContentEditableWarning={true}
            onBlur={(e) => onFormulaChange && onFormulaChange(e.currentTarget.textContent || "")}
          >
            {formula.formula.split(/(\[[^\]]+\])/).map((part, index) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                return <span key={index} className="text-primary">{part}</span>;
              } else if (part.match(/[+\-*/]/)) {
                return <span key={index} className="text-neutral-darker"> {part} </span>;
              } else {
                return <span key={index}>{part}</span>;
              }
            })}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-darker mb-2">Available Variables</label>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map((variable) => (
              <button 
                key={variable.id}
                className="bg-neutral-lighter hover:bg-neutral-light text-neutral-darker text-xs px-3 py-1 rounded-full"
                onClick={() => onVariableClick && onVariableClick(variable)}
              >
                {variable.name}
              </button>
            ))}
          </div>
        </div>
        
        {formula.result && (
          <div className="p-4 bg-neutral-lighter rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-neutral-darker">Preview</h4>
              <span className="text-xs text-neutral-dark">{formula.result.period || "Current Period"}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-neutral-darker">
                {formula.result.value}
              </span>
              {formula.result.change && (
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  formula.result.change.type === "positive" && "text-success",
                  formula.result.change.type === "negative" && "text-error",
                  formula.result.change.type === "neutral" && "text-neutral-dark"
                )}>
                  {formula.result.change.value}
                </span>
              )}
            </div>
            {formula.result.description && (
              <div className="mt-1 text-xs text-neutral-dark">{formula.result.description}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
