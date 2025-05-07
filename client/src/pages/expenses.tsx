import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header, ToolbarHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpensesTable, ExpenseCategoryData } from "@/components/dashboard/expenses-table";
import { MaterialIcon } from "@/components/ui/ui-icons";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFinancialContext } from "@/contexts/financial-context";

const Expenses: React.FC = () => {
  const { toast } = useToast();
  const { activeWorkspace, scenarios, setActiveScenario, activePeriod, setActivePeriod } = useFinancialContext();

  // Current user
  const [user] = useState({
    id: 1,
    fullName: "John Smith",
    initials: "JS"
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Fetch data
  const { data: expensesData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['/api/workspaces/1/expense-categories'],
    enabled: !!activeWorkspace
  });

  const { data: expenseTrendsData, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['/api/workspaces/1/expense-trends'],
    enabled: !!activeWorkspace
  });

  // Mock data for demonstration - in a real app, this would come from the API
  const expenseCategories: ExpenseCategoryData[] = [
    {
      id: "personnel",
      name: "Personnel",
      currentMonth: 32500,
      ytd: 156000,
      percentOfRevenue: 40.1
    },
    {
      id: "marketing",
      name: "Marketing",
      currentMonth: 15800,
      ytd: 72300,
      percentOfRevenue: 19.5
    },
    {
      id: "software",
      name: "Software & Tools",
      currentMonth: 4200,
      ytd: 19600,
      percentOfRevenue: 5.2
    },
    {
      id: "office",
      name: "Office & Operations",
      currentMonth: 5500,
      ytd: 27000,
      percentOfRevenue: 6.8
    }
  ];

  const expenseTrends = [
    { month: "Jan", personnel: 28000, marketing: 12000, software: 3800, office: 5000 },
    { month: "Feb", personnel: 28500, marketing: 13200, software: 3900, office: 5100 },
    { month: "Mar", personnel: 29000, marketing: 14500, software: 4000, office: 5200 },
    { month: "Apr", personnel: 30000, marketing: 15000, software: 4100, office: 5300 },
    { month: "May", personnel: 32000, marketing: 15500, software: 4200, office: 5400 },
    { month: "Jun", personnel: 32500, marketing: 15800, software: 4200, office: 5500 }
  ];

  // Event handlers
  const handleAddExpenseCategory = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditExpenseCategory = (id: string) => {
    setEditingCategory(id);
    setIsDialogOpen(true);
  };

  const handleSaveExpenseCategory = () => {
    toast({
      title: editingCategory ? "Category Updated" : "Category Added",
      description: editingCategory ? `Updated expense category ${editingCategory}` : "New expense category added",
    });
    setIsDialogOpen(false);
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
            title="Expense Management"
            onEdit={() => toast({ title: "Edit Expense Settings", description: "Opening expense settings" })}
            scenarios={scenarios.map(s => ({ id: s.id, name: s.name }))}
            activeScenario={scenarios.find(s => s.isActive)?.id}
            onScenarioChange={setActiveScenario}
            period={activePeriod}
            onPeriodChange={setActivePeriod}
          />

          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium text-neutral-darker">Expense Trends</h3>
                      <div className="flex space-x-2">
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="filter_list" />
                        </button>
                        <button className="text-neutral-dark hover:text-primary p-1">
                          <MaterialIcon name="more_horiz" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="chart-container" style={{ height: "350px" }}>
                      {isLoadingTrends ? (
                        <div className="h-full w-full bg-neutral-lighter rounded animate-pulse"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={expenseTrendsData?.data || expenseTrends}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="personnel" 
                              name="Personnel" 
                              stroke="#0078D4" 
                              activeDot={{ r: 8 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="marketing" 
                              name="Marketing" 
                              stroke="#50E6FF" 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="software" 
                              name="Software & Tools" 
                              stroke="#107C10" 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="office" 
                              name="Office & Operations" 
                              stroke="#D83B01" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <ExpensesTable 
                  categories={expensesData?.categories || expenseCategories}
                  isLoading={isLoadingExpenses}
                  onAddCategory={handleAddExpenseCategory}
                  onEditCategory={handleEditExpenseCategory}
                  onMoreOptions={() => toast({ title: "More Options", description: "Expense category options" })}
                />

                <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
                  <CardContent className="p-0">
                    <h3 className="font-medium text-neutral-darker mb-6">Expense Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Total Expenses YTD</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">$274,900</div>
                        <div className="text-sm text-warning mt-1">+9.8% year-over-year</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Average Monthly Burn</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">$45,816</div>
                        <div className="text-sm text-warning mt-1">+3.5% vs. last quarter</div>
                      </div>
                      <div className="bg-neutral-lighter p-4 rounded-md">
                        <h4 className="text-sm font-medium text-neutral-dark mb-2">Expenses as % of Revenue</h4>
                        <div className="text-2xl font-semibold text-neutral-darker">71.6%</div>
                        <div className="text-sm text-success mt-1">-2.3% vs. target</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-darker">Expense Categories</h3>
                  <Button onClick={handleAddExpenseCategory}>
                    <MaterialIcon name="add_circle" className="mr-2" />
                    Add Category
                  </Button>
                </div>
                
                {isLoadingExpenses ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-white rounded-lg shadow-sm border border-neutral-light"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenseCategories.map((category) => (
                      <Card key={category.id} className="bg-white shadow-sm border border-neutral-light">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <h4 className="font-medium text-neutral-darker mb-2">{category.name}</h4>
                              <p className="text-sm text-neutral-dark mb-4">
                                {category.id === "personnel" 
                                  ? "Salaries, benefits, and taxes for all employees" 
                                  : category.id === "marketing"
                                  ? "Advertising, promotions, and marketing campaigns"
                                  : category.id === "software"
                                  ? "SaaS subscriptions and software licenses"
                                  : "Office rent, utilities, and operations"}
                              </p>
                              <div className="flex space-x-6">
                                <div>
                                  <div className="text-xs text-neutral-dark">Current Month</div>
                                  <div className="text-lg font-medium text-neutral-darker">
                                    ${category.currentMonth.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-neutral-dark">YTD</div>
                                  <div className="text-lg font-medium text-neutral-darker">
                                    ${category.ytd.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-neutral-dark">% of Revenue</div>
                                  <div className="text-lg font-medium text-neutral-darker">
                                    {category.percentOfRevenue.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-4 md:mt-0">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditExpenseCategory(category.id)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toast({ title: "View Details", description: `Viewing details for ${category.name}` })}
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="forecasting" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-darker">Expense Forecasting</h3>
                  <Button onClick={() => toast({ title: "Run Forecast", description: "Generating expense forecast" })}>
                    <MaterialIcon name="trending_up" className="mr-2" />
                    Run Forecast
                  </Button>
                </div>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darker mb-4">Forecasting Parameters</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Forecast Period (months)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="12" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Growth Rate (%)
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="5" 
                          className="border-neutral-light"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Seasonality Factor
                        </label>
                        <Input 
                          type="number" 
                          defaultValue="1.0" 
                          className="border-neutral-light"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => toast({ title: "Update Parameters", description: "Forecasting parameters updated" })}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm border border-neutral-light">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-medium text-neutral-darker">Expense Forecast</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast({ title: "Export Forecast", description: "Exporting forecast data" })}
                      >
                        Export
                      </Button>
                    </div>
                    
                    <div className="chart-container" style={{ height: "350px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jul 23", actual: 58000, forecast: 58000 },
                            { month: "Aug 23", actual: 58500, forecast: 58500 },
                            { month: "Sep 23", actual: 59000, forecast: 59000 },
                            { month: "Oct 23", actual: 0, forecast: 59750 },
                            { month: "Nov 23", actual: 0, forecast: 60500 },
                            { month: "Dec 23", actual: 0, forecast: 61250 },
                            { month: "Jan 24", actual: 0, forecast: 62000 },
                            { month: "Feb 24", actual: 0, forecast: 63000 },
                            { month: "Mar 24", actual: 0, forecast: 64000 },
                            { month: "Apr 24", actual: 0, forecast: 65000 },
                            { month: "May 24", actual: 0, forecast: 66000 },
                            { month: "Jun 24", actual: 0, forecast: 67000 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            name="Actual Expenses" 
                            stroke="#0078D4" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="forecast" 
                            name="Forecasted Expenses" 
                            stroke="#EDEBE9" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Expense Category" : "Add Expense Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Update the details for this expense category" 
                : "Create a new expense category to track your expenses"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name" 
                defaultValue={editingCategory ? expenseCategories.find(c => c.id === editingCategory)?.name : ""} 
                placeholder="e.g., Marketing, Office Supplies" 
                className="border-neutral-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                defaultValue={editingCategory ? "Existing description" : ""} 
                placeholder="Brief description of this expense category" 
                className="border-neutral-light"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  defaultValue={editingCategory ? expenseCategories.find(c => c.id === editingCategory)?.currentMonth : ""} 
                  placeholder="e.g., 5000" 
                  className="border-neutral-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth">Growth Rate (%)</Label>
                <Input 
                  id="growth" 
                  type="number" 
                  defaultValue="5" 
                  placeholder="e.g., 5" 
                  className="border-neutral-light"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveExpenseCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
