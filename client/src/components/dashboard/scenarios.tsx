import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "../ui/ui-icons";
import { cn } from "@/lib/utils";

export interface ScenarioData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  metrics: {
    mrrGrowth: {
      value: number;
      label: string;
      percentage: number;
    };
    burnRate: {
      value: number;
      label: string;
      percentage: number;
    };
    runway: {
      value: number;
      label: string;
      percentage: number;
    };
  };
}

interface ScenariosProps {
  scenarios: ScenarioData[];
  isLoading?: boolean;
  onViewScenarioDetails?: (id: string) => void;
  onEditScenario?: (id: string) => void;
  onCreateScenario?: () => void;
}

export const Scenarios: React.FC<ScenariosProps> = ({
  scenarios,
  isLoading = false,
  onViewScenarioDetails,
  onEditScenario,
  onCreateScenario,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
            <CardContent className="p-0">
              <div className="h-6 bg-neutral-lighter w-1/3 rounded mb-4"></div>
              <div className="h-4 bg-neutral-lighter w-2/3 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-8 bg-neutral-lighter rounded"></div>
                <div className="h-8 bg-neutral-lighter rounded"></div>
                <div className="h-8 bg-neutral-lighter rounded"></div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-light">
                <div className="h-10 bg-neutral-lighter rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-neutral-darker">{scenario.name}</h3>
                <p className="text-xs text-neutral-dark mt-1">{scenario.description}</p>
              </div>
              <Badge 
                variant={scenario.isActive ? "outline" : "secondary"}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  scenario.isActive 
                    ? "bg-primary-light bg-opacity-20 text-primary" 
                    : "bg-neutral-lighter text-neutral-dark"
                )}
              >
                {scenario.isActive ? "Active" : "Draft"}
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-dark">MRR Growth</span>
                  <span className="text-xs font-medium text-neutral-darker">{scenario.metrics.mrrGrowth.label}</span>
                </div>
                <div className="h-1.5 bg-neutral-lighter rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${scenario.metrics.mrrGrowth.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-dark">Burn Rate</span>
                  <span className="text-xs font-medium text-neutral-darker">{scenario.metrics.burnRate.label}</span>
                </div>
                <div className="h-1.5 bg-neutral-lighter rounded-full">
                  <div 
                    className="h-full bg-warning rounded-full" 
                    style={{ width: `${scenario.metrics.burnRate.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-dark">Runway</span>
                  <span className="text-xs font-medium text-neutral-darker">{scenario.metrics.runway.label}</span>
                </div>
                <div className="h-1.5 bg-neutral-lighter rounded-full">
                  <div 
                    className="h-full bg-success rounded-full" 
                    style={{ width: `${scenario.metrics.runway.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-light">
              {scenario.isActive ? (
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  onClick={() => onViewScenarioDetails && onViewScenarioDetails(scenario.id)}
                >
                  View Details
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => onEditScenario && onEditScenario(scenario.id)}
                >
                  Edit Scenario
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="bg-white rounded-lg shadow-sm p-5 border border-dashed border-neutral-light">
        <CardContent className="p-0">
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-neutral-medium mb-2">
              <MaterialIcon name="add_circle_outline" className="text-2xl" />
            </div>
            <h3 className="font-medium text-neutral-darker mb-1">Create New Scenario</h3>
            <p className="text-xs text-neutral-dark mb-4">Test different assumptions and growth models</p>
            <Button 
              variant="secondary"
              className="bg-neutral-lighter hover:bg-neutral-light text-neutral-darker"
              onClick={onCreateScenario}
            >
              Create Scenario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
