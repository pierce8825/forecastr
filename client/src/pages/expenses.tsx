import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign,
  Filter
} from "lucide-react";
import { Helmet } from "react-helmet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Expenses = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Demo user ID for MVP
  const userId = 1;
  
  // Get the active forecast
  const { data: forecasts } = useQuery({
    queryKey: ["/api/forecasts", { userId }],
    queryFn: async () => {
      const res = await fetch(`/api/forecasts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      return res.json();
    },
  });

  const activeForecast = forecasts?.[0];
  const forecastId = activeForecast?.id;

  // Fetch expenses
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["/api/expenses", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/expenses?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Mutations for expenses
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense) => {
      return await apiRequest("POST", "/api/expenses", newExpense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setIsAddExpenseDialogOpen(false);
      toast({
        title: "Expense added",
        description: "New expense has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // State for expense link type
  const [linkType, setLinkType] = useState("none");
  const [useFormula, setUseFormula] = useState(false);
  const [formulaPreview, setFormulaPreview] = useState(null);
  
  // Fetch revenue streams, drivers, and personnel for linking
  const { data: revenueStreams, isLoading: isLoadingStreams } = useQuery({
    queryKey: ["/api/revenue-streams", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/revenue-streams?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue streams");
      return res.json();
    },
    enabled: !!forecastId,
  });
  
  const { data: revenueDrivers, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["/api/revenue-drivers", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/revenue-drivers?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue drivers");
      return res.json();
    },
    enabled: !!forecastId,
  });
  
  const { data: personnelRoles, isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ["/api/personnel-roles", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/personnel-roles?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch personnel roles");
      return res.json();
    },
    enabled: !!forecastId,
  });
  
  // Handle formula preview calculation
  const handleFormulaPreview = async (formula) => {
    if (!formula) {
      setFormulaPreview(null);
      return;
    }
    
    try {
      // Get personnel count if linking to personnel
      let variables = {};
      const linkedId = document.querySelector(
        linkType === 'stream' ? 'select[name="linkedStreamId"]' : 
        linkType === 'driver' ? 'select[name="linkedDriverId"]' : 
        linkType === 'personnel' ? 'select[name="linkedPersonnelId"]' : null
      )?.value;
      
      if (linkType === 'personnel' && linkedId) {
        const personnel = personnelRoles?.find(p => p.id.toString() === linkedId);
        if (personnel) {
          variables.headcount = personnel.count;
          variables.salary = Number(personnel.annualSalary);
        }
      } else if (linkType === 'driver' && linkedId) {
        const driver = revenueDrivers?.find(d => d.id.toString() === linkedId);
        if (driver) {
          variables.value = Number(driver.value);
        }
      } else if (linkType === 'stream' && linkedId) {
        const stream = revenueStreams?.find(s => s.id.toString() === linkedId);
        if (stream) {
          variables.amount = Number(stream.amount);
        }
      }
      
      // Use formula parser to calculate
      const { formulaParser } = await import('@/lib/formula-parser');
      formulaParser.setVariables(variables);
      
      if (formulaParser.validate(formula)) {
        const result = formulaParser.evaluate(formula);
        setFormulaPreview(result);
      } else {
        setFormulaPreview('Invalid formula');
      }
    } catch (error) {
      setFormulaPreview('Error calculating');
    }
  };
  
  // Form handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Prepare expense data
    const expenseData = {
      forecastId,
      name: formData.get("name"),
      frequency: formData.get("frequency"),
      category: formData.get("category"),
      isCogsRelated: formData.get("isCogsRelated") === "on",
    };
    
    // Handle formula and amount
    if (useFormula) {
      expenseData.formula = formData.get("formula");
      expenseData.amount = formulaPreview || 0; // Use previewed amount or default to 0
    } else {
      expenseData.amount = formData.get("amount");
    }
    
    // Add linked items based on selection
    if (linkType === "stream") {
      expenseData.linkedStreamId = Number(formData.get("linkedStreamId"));
    } else if (linkType === "driver") {
      expenseData.linkedDriverId = Number(formData.get("linkedDriverId"));
    } else if (linkType === "personnel") {
      expenseData.linkedPersonnelId = Number(formData.get("linkedPersonnelId"));
    }
    
    addExpenseMutation.mutate(expenseData);
  };

  // Filter expenses by category
  const filteredExpenses = activeTab === "all" 
    ? expenses 
    : expenses?.filter(expense => expense.category === activeTab);

  // Process expenses by category for chart
  const expensesByCategory = expenses?.reduce((acc, expense) => {
    const category = expense.category || "Other";
    const amount = Number(expense.amount);
    
    if (!acc[category]) {
      acc[category] = {
        name: category,
        value: 0,
        color: category === 'Marketing' ? '#3B82F6' : 
               category === 'Software' ? '#10B981' : 
               category === 'Office' ? '#F59E0B' : 
               category === 'Other' ? '#EF4444' : '#8B5CF6'
      };
    }
    
    acc[category].value += amount;
    return acc;
  }, {}) || {};
  
  // Convert to array and sort by value
  const expenseCategories = Object.values(expensesByCategory)
    .sort((a, b) => b.value - a.value);
  
  // Calculate total
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.value, 0);

  // Create expense trend data (monthly projection)
  const expenseTrendData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
    const result = { name: month };
    
    // Initialize with zero values for each category
    expenseCategories.forEach(category => {
      result[category.name] = 0;
    });
    
    // Calculate monthly expenses
    expenses?.forEach(expense => {
      if (expense.frequency === 'monthly') {
        result[expense.category || "Other"] += Number(expense.amount);
      } else if (expense.frequency === 'quarterly' && i % 3 === 0) {
        result[expense.category || "Other"] += Number(expense.amount) / 3;
      } else if (expense.frequency === 'annual' && i === 0) {
        result[expense.category || "Other"] += Number(expense.amount) / 12;
      } else if (expense.frequency === 'one-time' && i === 0) {
        result[expense.category || "Other"] += Number(expense.amount);
      }
    });
    
    return result;
  });

  const isLoading = isLoadingExpenses;

  return (
    <>
      <Helmet>
        <title>Expense Management | FinanceForge</title>
        <meta name="description" content="Track, categorize, and forecast your business expenses to optimize spending and improve financial planning." />
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Expense Management</h1>
            <p className="text-muted-foreground">Track and manage your business expenses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddExpenseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Monthly Expenses</CardTitle>
              <CardDescription>All categories combined</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 font-tabular">
                ${totalExpenses.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {expenses?.length || 0} expense items tracked
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">COGS Related</CardTitle>
              <CardDescription>Direct cost of goods sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 font-tabular">
                ${expenses?.filter(e => e.isCogsRelated)
                          .reduce((sum, e) => sum + Number(e.amount), 0)
                          .toLocaleString() || "0"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {expenses?.filter(e => e.isCogsRelated).length || 0} expense items
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Largest Category</CardTitle>
              <CardDescription>Highest spending area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 font-tabular">
                {expenseCategories[0]?.name || "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${expenseCategories[0]?.value.toLocaleString() || "0"} 
                ({expenseCategories[0] 
                  ? Math.round((expenseCategories[0].value / totalExpenses) * 100) 
                  : 0}% of total)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading expense data...</p>
                  </div>
                ) : expenseCategories.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <p className="text-muted-foreground mb-2">No expense data available</p>
                      <Button size="sm" onClick={() => setIsAddExpenseDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Expense
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>Projected expenses over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading expense data...</p>
                  </div>
                ) : expenses?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <p className="text-muted-foreground mb-2">No expense data available</p>
                      <Button size="sm" onClick={() => setIsAddExpenseDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Expense
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={expenseTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                      <Tooltip 
                        formatter={(value) => `$${Number(value).toLocaleString()}`} 
                      />
                      <Legend />
                      {expenseCategories.map((category, index) => (
                        <Line
                          key={index}
                          type="monotone"
                          dataKey={category.name}
                          stroke={category.color}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expense List</CardTitle>
              <CardDescription>
                Manage your expense items
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" onClick={() => setIsAddExpenseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All Categories</TabsTrigger>
                {expenseCategories.map((category, index) => (
                  <TabsTrigger key={index} value={category.name} className="min-w-[100px]">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <p>Loading expenses...</p>
                  </div>
                ) : filteredExpenses?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No expenses found for this category</p>
                    <Button onClick={() => setIsAddExpenseDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left">Name</th>
                          <th className="py-3 px-2 text-left">Category</th>
                          <th className="py-3 px-2 text-right">Amount</th>
                          <th className="py-3 px-2 text-right">Frequency</th>
                          <th className="py-3 px-2 text-center">COGS</th>
                          <th className="py-3 px-2 text-left">Linked To</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses?.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div>
                                {expense.name}
                                {expense.formula && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Formula: {expense.formula}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">{expense.category || "Uncategorized"}</td>
                            <td className="py-3 px-2 text-right font-tabular">
                              ${Number(expense.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {expense.isCogsRelated ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {expense.linkedStreamId ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Revenue Stream {expense.linkedStreamId}
                                </span>
                              ) : expense.linkedDriverId ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Revenue Driver {expense.linkedDriverId}
                                </span>
                              ) : expense.linkedPersonnelId ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Personnel {expense.linkedPersonnelId}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseDialogOpen} onOpenChange={(open) => {
        setIsAddExpenseDialogOpen(open);
        if (!open) {
          // Reset state when dialog closes
          setLinkType("none");
          setUseFormula(false);
          setFormulaPreview(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Add a new expense to your forecast.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" placeholder="Software Subscription" required />
              </div>
              
              {/* Link Type Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkType" className="text-right">
                  Link To
                </Label>
                <Select value={linkType} onValueChange={setLinkType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No link</SelectItem>
                    <SelectItem value="stream">Revenue Stream</SelectItem>
                    <SelectItem value="driver">Revenue Driver</SelectItem>
                    <SelectItem value="personnel">Personnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Dynamic Link Selection */}
              {linkType === "stream" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="linkedStreamId" className="text-right">
                    Stream
                  </Label>
                  <Select name="linkedStreamId">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select revenue stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStreams ? (
                        <SelectItem value="" disabled>Loading streams...</SelectItem>
                      ) : revenueStreams?.length > 0 ? (
                        revenueStreams.map(stream => (
                          <SelectItem key={stream.id} value={stream.id.toString()}>
                            {stream.name} (${Number(stream.amount).toLocaleString()})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No streams available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {linkType === "driver" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="linkedDriverId" className="text-right">
                    Driver
                  </Label>
                  <Select name="linkedDriverId">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select revenue driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDrivers ? (
                        <SelectItem value="" disabled>Loading drivers...</SelectItem>
                      ) : revenueDrivers?.length > 0 ? (
                        revenueDrivers.map(driver => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.name} ({driver.value} {driver.unit})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No drivers available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {linkType === "personnel" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="linkedPersonnelId" className="text-right">
                    Personnel
                  </Label>
                  <Select name="linkedPersonnelId">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select personnel role" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPersonnel ? (
                        <SelectItem value="" disabled>Loading personnel...</SelectItem>
                      ) : personnelRoles?.length > 0 ? (
                        personnelRoles.map(role => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.title} ({role.count} people)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No personnel roles available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Toggle Formula Calculation */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 flex items-center space-x-2">
                  <Checkbox 
                    id="useFormula" 
                    checked={useFormula}
                    onCheckedChange={(checked) => {
                      setUseFormula(checked === true);
                      if (!checked) {
                        setFormulaPreview(null);
                      }
                    }}
                  />
                  <Label htmlFor="useFormula">
                    Use formula to calculate amount
                  </Label>
                </div>
              </div>
              
              {useFormula ? (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="formula" className="text-right mt-2">
                    Formula
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input 
                      id="formula" 
                      name="formula" 
                      placeholder={
                        linkType === "personnel" ? "headcount * 50 (per-seat cost)" : 
                        linkType === "driver" ? "value * 0.1 (percentage of driver)" :
                        "Enter calculation formula"
                      }
                      onChange={(e) => handleFormulaPreview(e.target.value)}
                    />
                    <div className="text-sm text-muted-foreground">
                      {linkType === "personnel" && "Variables: headcount, salary"}
                      {linkType === "driver" && "Variables: value"}
                      {linkType === "stream" && "Variables: amount"}
                      {linkType === "none" && "Use standard mathematical operations (*, +, -, /, etc.)"}
                    </div>
                    {formulaPreview !== null && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Calculated Amount: </span>
                        <span className="font-medium">
                          {typeof formulaPreview === 'number' 
                            ? `$${formulaPreview.toLocaleString()}`
                            : formulaPreview}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <div className="col-span-3 flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      $
                    </span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      className="rounded-l-none"
                      min="0"
                      step="0.01"
                      required={!useFormula}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select name="frequency" defaultValue="monthly">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select name="category" defaultValue="Software">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Personnel">Personnel</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 flex items-center space-x-2 justify-end">
                  <Checkbox id="isCogsRelated" name="isCogsRelated" />
                  <Label htmlFor="isCogsRelated">
                    This expense is related to Cost of Goods Sold (COGS)
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addExpenseMutation.isPending || (useFormula && typeof formulaPreview !== 'number')}
              >
                {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Expenses;
