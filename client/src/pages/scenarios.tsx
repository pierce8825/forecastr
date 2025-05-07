import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/ui-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar
} from "recharts";
import { useFinancialContext } from "@/contexts/financial-context";

interface ScenarioData {
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
  assumptions: Record<string, any>;
}

const Scenarios: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios: contextScenarios, setActiveScenario } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioToCompare, setScenarioToCompare] = useState<string | null>(null);

  // Fetch data
  const { data: scenariosData, isLoading: isLoadingScenarios } = useQuery({
    queryKey: ['/api/workspaces/1/scenarios'],
    enabled: !!activeWorkspace
  });

  // Mock data for demonstration - in a real app, this would come from the API
  const scenarios: ScenarioData[] = [
    {
      id: "base",
      name: "Base Scenario",
      description: "Current plan",
      isActive: true,
      metrics: {
        mrrGrowth: {
          value: 10,
          label: "10% monthly",
          percentage: 60
        },
        burnRate: {
          value: 42000,
          label: "$42K monthly",
          percentage: 70
        },
        runway: {
          value: 14.2,
          label: "14.2 months",
          percentage: 80
        }
      },
      assumptions: {
        revenueGrowth: 10,
        churnRate: 3.5,
        expenseGrowth: 5,
        headcountGrowth: 15
      }
    },
    {
      id: "optimistic",
      name: "Optimistic Growth",
      description: "Product-market fit",
      isActive: false,
      metrics: {
        mrrGrowth: {
          value: 18,
          label: "18% monthly",
          percentage: 85
        },
        burnRate: {
          value: 52000,
          label: "$52K monthly",
          percentage: 85
        },
        runway: {
          value: 11.9,
          label: "11.9 months",
          percentage: 65
        }
      },
      assumptions: {
        revenueGrowth: 18,
        churnRate: 2.5,
        expenseGrowth: 8,
        headcountGrowth: 25
      }
    },
    {
      id: "conservative",
      name: "Conservative Plan",
      description: "Slower growth, focus on profitability",
      isActive: false,
      metrics: {
        mrrGrowth: {
          value: 6,
          label: "6% monthly",
          percentage: 40
        },
        burnRate: {
          value: 36000,
          label: "$36K monthly",
          percentage: 55
        },
        runway: {
          value: 17.5,
          label: "17.5 months",
          percentage: 90
        }
      },
      assumptions: {
        revenueGrowth: 6,
        churnRate: 2.8,
        expenseGrowth: 3,
        headcountGrowth: 8
      }
    }
  ];

  const comparisonChartData = [
    { month: "Jul 23", base: 78500, optimistic: 84000, conservative: 76000 },
    { month: "Aug 23", base: 83200, optimistic: 99000, conservative: 80000 },
    { month: "Sep 23", base: 88500, optimistic: 116800, conservative: 84800 },
    { month: "Oct 23", base: 94100, optimistic: 137800, conservative: 89900 },
    { month: "Nov 23", base: 100200, optimistic: 162600, conservative: 95300 },
    { month: "Dec 23", base: 106700, optimistic: 191900, conservative: 101000 },
    { month: "Jan 24", base: 113700, optimistic: 226400, conservative: 107000 },
    { month: "Feb 24", base: 121200, optimistic: 267100, conservative: 113400 },
    { month: "Mar 24", base: 129300, optimistic: 315200, conservative: 120200 },
    { month: "Apr 24", base: 138000, optimistic: 371900, conservative: 127400 },
    { month: "May 24", base: 147400, optimistic: 438800, conservative: 135000 },
    { month: "Jun 24", base: 157400, optimistic: 517800, conservative: 143100 }
  ];

  const handleCreateScenario = () => {
    toast({
      title: "Scenario Created",
      description: "New scenario has been created successfully"
    });
    setIsCreateDialogOpen(false);
  };

  const handleViewScenarioDetails = (id: string) => {
    setSelectedScenario(id);
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveScenario(id);
      toast({
        title: "Scenario Updated",
        description: "Active scenario has been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update active scenario",
        variant: "destructive"
      });
    }
  };

  const handleCompareScenarios = () => {
    if (selectedScenario && scenarioToCompare) {
      setIsCompareDialogOpen(true);
    } else {
      toast({
        title: "Selection Required",
        description: "Please select two scenarios to compare",
        variant: "destructive"
      });
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeWorkspace={activeWorkspace}
        />

        <main className="flex-1 overflow-y-auto bg-neutral-lighter">
          <ToolbarHeader 
            title="Scenario Planning"
            onEdit={() => toast({ title: "Edit Scenario Settings", description: "Opening scenario settings" })}
            showScenarioSelector={false}
            showPeriodSelector={false}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-neutral-darker">Scenarios</h2>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={handleCompareScenarios}
                  disabled={!selectedScenario || !scenarioToCompare}
                >
                  Compare Scenarios
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <MaterialIcon name="add_circle" className="mr-2" />
                  Create Scenario
                </Button>
              </div>
            </div>
            
            {isLoadingScenarios ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-72 bg-white rounded-lg shadow-sm border border-neutral-light"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {(scenariosData?.scenarios || scenarios).map((scenario) => (
                  <Card 
                    key={scenario.id} 
                    className={cn(
                      "bg-white rounded-lg shadow-sm p-5 border",
                      selectedScenario === scenario.id 
                        ? "border-primary" 
                        : "border-neutral-light",
                      selectedScenario === scenario.id 
                        ? "ring-2 ring-primary ring-opacity-50" 
                        : ""
                    )}
                    onClick={() => {
                      if (selectedScenario === scenario.id) {
                        setSelectedScenario(null);
                      } else {
                        setSelectedScenario(scenario.id);
                        if (!scenarioToCompare) {
                          setScenarioToCompare(scenario.id);
                        }
                      }
                    }}
                  >
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
                        <div className="flex space-x-2">
                          {scenario.isActive ? (
                            <Button 
                              className="flex-1 bg-primary hover:bg-primary-dark text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewScenarioDetails(scenario.id);
                              }}
                            >
                              View Details
                            </Button>
                          ) : (
                            <>
                              <Button 
                                variant="outline"
                                className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewScenarioDetails(scenario.id);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetActive(scenario.id);
                                }}
                              >
                                Set Active
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {selectedScenario && (
              <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light mb-8">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium text-neutral-darker">
                      {scenarios.find(s => s.id === selectedScenario)?.name} - Assumptions
                    </h3>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast({ title: "Edit Assumptions", description: "Opening assumptions editor" })}
                      >
                        Edit Assumptions
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast({ title: "Clone Scenario", description: "Creating a copy of the scenario" })}
                      >
                        Clone
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assumption</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Impact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Revenue Growth</TableCell>
                          <TableCell>{scenarios.find(s => s.id === selectedScenario)?.assumptions.revenueGrowth}% monthly</TableCell>
                          <TableCell>Monthly growth rate for revenue streams</TableCell>
                          <TableCell className="text-success">High</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Churn Rate</TableCell>
                          <TableCell>{scenarios.find(s => s.id === selectedScenario)?.assumptions.churnRate}% monthly</TableCell>
                          <TableCell>Monthly customer churn rate</TableCell>
                          <TableCell className="text-warning">Medium</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Expense Growth</TableCell>
                          <TableCell>{scenarios.find(s => s.id === selectedScenario)?.assumptions.expenseGrowth}% monthly</TableCell>
                          <TableCell>Monthly growth rate for expenses</TableCell>
                          <TableCell className="text-warning">Medium</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Headcount Growth</TableCell>
                          <TableCell>{scenarios.find(s => s.id === selectedScenario)?.assumptions.headcountGrowth}% annually</TableCell>
                          <TableCell>Annual growth in team size</TableCell>
                          <TableCell className="text-warning">Medium</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-neutral-darker mb-4">Revenue Projection</h4>
                    <div className="chart-container" style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={comparisonChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Line 
                            type="monotone" 
                            dataKey={selectedScenario}
                            name={scenarios.find(s => s.id === selectedScenario)?.name} 
                            stroke="#0078D4" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      
      {/* Create Scenario Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
            <DialogDescription>
              Create a new scenario to test different assumptions and growth models
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Scenario Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Aggressive Growth, Balanced Plan" 
                className="border-neutral-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of this scenario" 
                className="border-neutral-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseOn">Base On</Label>
              <div className="grid grid-cols-1 gap-2">
                {scenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:border-primary"
                  >
                    <input
                      type="radio"
                      id={`scenario-${scenario.id}`}
                      name="baseScenario"
                      value={scenario.id}
                      className="text-primary"
                    />
                    <label htmlFor={`scenario-${scenario.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-neutral-dark">{scenario.description}</div>
                    </label>
                    {scenario.isActive && (
                      <Badge className="bg-primary-light bg-opacity-20 text-primary text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateScenario}>Create Scenario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Compare Scenarios Dialog */}
      <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Compare Scenarios</DialogTitle>
            <DialogDescription>
              Compare projections between different scenarios
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-medium text-neutral-darker mb-4">Revenue Comparison</h4>
            <div className="chart-container" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="base" 
                    name="Base Scenario" 
                    stroke="#0078D4" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimistic" 
                    name="Optimistic Growth" 
                    stroke="#107C10" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conservative" 
                    name="Conservative Plan" 
                    stroke="#A19F9D" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-neutral-darker mb-4">Key Metrics Comparison</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Base Scenario</TableHead>
                    <TableHead className="text-right">Optimistic Growth</TableHead>
                    <TableHead className="text-right">Conservative Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">12-Month Revenue</TableCell>
                    <TableCell className="text-right">$1,356,700</TableCell>
                    <TableCell className="text-right">$2,718,900</TableCell>
                    <TableCell className="text-right">$1,179,100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Profit Margin (12m)</TableCell>
                    <TableCell className="text-right">23.5%</TableCell>
                    <TableCell className="text-right">31.2%</TableCell>
                    <TableCell className="text-right">18.7%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cash Balance (EOY)</TableCell>
                    <TableCell className="text-right">$1,213,700</TableCell>
                    <TableCell className="text-right">$1,954,200</TableCell>
                    <TableCell className="text-right">$982,500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Runway</TableCell>
                    <TableCell className="text-right">24.8 months</TableCell>
                    <TableCell className="text-right">21.3 months</TableCell>
                    <TableCell className="text-right">29.5 months</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompareDialogOpen(false)}>Close</Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Export Comparison",
                  description: "Exporting comparison data to CSV"
                });
              }}
            >
              Export Comparison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scenarios;
