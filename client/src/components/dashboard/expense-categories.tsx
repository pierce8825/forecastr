import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PencilIcon, Plus, Hash, TagIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExpenseCategoriesProps {
  forecastId?: number;
  isLoading: boolean;
}

export function ExpenseCategories({ forecastId, isLoading }: ExpenseCategoriesProps) {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch expense categories
  const { data: expenseCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/expenses", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/expenses?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch expense categories");
      return res.json();
    },
    enabled: !!forecastId,
  });

  // Mutation to add a new expense category
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest("POST", "/api/expenses", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setIsAddCategoryDialogOpen(false);
      toast({
        title: "Success",
        description: "Expense category added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add expense category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const categoryData = {
      forecastId,
      name: formData.get("name"),
      type: formData.get("type"),
      amount: formData.get("amount"),
      frequency: formData.get("frequency"),
      formula: formData.get("formula") || null,
      description: formData.get("description") || null,
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
    };

    addCategoryMutation.mutate(categoryData);
  };

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format expense type
  const formatExpenseType = (type: string) => {
    switch (type) {
      case "fixed": return "Fixed";
      case "variable": return "Variable";
      case "one-time": return "One-time";
      default: return type;
    }
  };

  if (isLoading || isLoadingCategories) {
    return (
      <Card>
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        
        <CardContent className="p-5">
          <div className="space-y-5">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800">Expense Categories</h3>
          <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setIsAddCategoryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        {expenseCategories?.length > 0 ? (
          <div className="space-y-5">
            {expenseCategories.map((category: any) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                        <PencilIcon className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {formatExpenseType(category.type)}
                      </Badge>
                      {category.formula && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          <Hash className="h-3 w-3 mr-1" />
                          Formula
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-tabular font-medium text-gray-900">
                      {formatAmount(Number(category.amount))}
                      {category.frequency && category.frequency !== "one-time" && (
                        <span className="text-xs text-gray-500 ml-1">/{category.frequency}</span>
                      )}
                    </div>
                    {category.description && (
                      <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate text-right">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {(category.startDate || category.endDate) && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    {category.startDate && (
                      <span>From: {new Date(category.startDate).toLocaleDateString()}</span>
                    )}
                    {category.startDate && category.endDate && (
                      <span className="mx-1">•</span>
                    )}
                    {category.endDate && (
                      <span>Until: {new Date(category.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No expense categories found</p>
            <Button onClick={() => setIsAddCategoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Category
            </Button>
          </div>
        )}
        
        {expenseCategories?.length > 0 && (
          <Button 
            variant="outline" 
            className="mt-6 border border-dashed border-gray-300 rounded-lg p-3 w-full text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400"
            onClick={() => setIsAddCategoryDialogOpen(true)}
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add expense category</span>
            </div>
          </Button>
        )}
      </CardContent>

      {/* Add Expense Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Expense Category</DialogTitle>
            <DialogDescription>
              Add a new expense category to track your business costs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Office Rent" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue="fixed">
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select name="frequency" defaultValue="monthly">
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  placeholder="2500" 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="formula">Formula (optional)</Label>
                <Input 
                  id="formula" 
                  name="formula" 
                  placeholder="team_size * cost_per_seat" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Additional notes about this expense"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addCategoryMutation.isPending}>
                {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}