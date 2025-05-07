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

  // Form handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    addExpenseMutation.mutate({
      forecastId,
      name: formData.get("name"),
      amount: formData.get("amount"),
      frequency: formData.get("frequency"),
      category: formData.get("category"),
      isCogsRelated: formData.get("isCogsRelated") === "on",
    });
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
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses?.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">{expense.name}</td>
                            <td className="py-3 px-2">{expense.category || "Uncategorized"}</td>
                            <td className="py-3 px-2 text-right font-tabular">
                              ${Number(expense.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {expense.isCogsRelated ? "Yes" : "No"}
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
      <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                    required
                  />
                </div>
              </div>
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
              <Button type="submit" disabled={addExpenseMutation.isPending}>
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
