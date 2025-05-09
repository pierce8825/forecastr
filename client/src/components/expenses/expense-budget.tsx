import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash, DollarSign, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExpenseBudgetProps {
  forecastId?: number;
}

export const ExpenseBudget: React.FC<ExpenseBudgetProps> = ({ forecastId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [category, setCategory] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  
  // Get current year and the next 5 years for the dropdown
  const years = Array.from({ length: 6 }, (_, i) => 
    (new Date().getFullYear() + i).toString()
  );

  // Fetch expense categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/expenses/categories", { forecastId }],
    queryFn: async () => {
      if (!forecastId) return [];
      const res = await fetch(`/api/expenses?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch expense categories");
      const expenses = await res.json();
      
      // Extract unique categories
      const categoriesMap: Record<string, boolean> = {};
      expenses.forEach((e: any) => {
        if (e.category) {
          categoriesMap[e.category] = true;
        }
      });
      return Object.keys(categoriesMap).map((cat: string) => ({
        name: cat
      }));
    },
    enabled: !!forecastId,
  });

  // Fetch departments
  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["/api/departments", { forecastId }],
    queryFn: async () => {
      if (!forecastId) return [];
      const res = await fetch(`/api/departments?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch departments");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Fetch budgets
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({
    queryKey: ["/api/expense-budgets", { forecastId, year }],
    queryFn: async () => {
      if (!forecastId) return [];
      const res = await fetch(`/api/expense-budgets?forecastId=${forecastId}${year ? `&year=${year}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch expense budgets");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Create budget mutation
  const createBudget = useMutation({
    mutationFn: (budgetData: any) => {
      return apiRequest("/api/expense-budgets", "POST", budgetData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      setCategory("");
      setDepartment("");
      setBudgetAmount("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/expense-budgets"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create budget",
        variant: "destructive",
      });
    },
  });

  // Delete budget mutation
  const deleteBudget = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/expense-budgets/${id}`, "DELETE", null);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-budgets"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete budget",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !year || !budgetAmount) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    createBudget.mutate({
      forecastId,
      category,
      department: department || null,
      year: parseInt(year),
      amount: parseFloat(budgetAmount),
      description: description || null,
    });
  };

  const isLoading = isLoadingCategories || isLoadingDepartments || isLoadingBudgets;
  const isFormDisabled = createBudget.isPending;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMonthlyBudgetAmount = (amount: number) => {
    return amount / 12;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Expense Budget</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category*</label>
                  <Select value={category} onValueChange={setCategory} disabled={isFormDisabled}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: any, idx: number) => (
                        <SelectItem key={idx} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Department</label>
                  <Select 
                    value={department} 
                    onValueChange={(value) => {
                      setDepartment(value);
                    }} 
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Year*</label>
                  <Select value={year} onValueChange={setYear} disabled={isFormDisabled}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((yr) => (
                        <SelectItem key={yr} value={yr}>
                          {yr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Budget Amount (Annual)*</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="50000"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      disabled={isFormDisabled}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input
                    type="text"
                    placeholder="Budget description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isFormDisabled}>
                  {createBudget.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Budget
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Budget for {year}</CardTitle>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((yr) => (
                <SelectItem key={yr} value={yr}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (budgets && budgets.length > 0) ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Annual Budget</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets && budgets.map((budget: any) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.category}</TableCell>
                    <TableCell>{budget.department || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(budget.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(getMonthlyBudgetAmount(budget.amount))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBudget.mutate(budget.id)}
                        disabled={deleteBudget.isPending}
                      >
                        <Trash className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No budgets found for {year}. Create a budget above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};