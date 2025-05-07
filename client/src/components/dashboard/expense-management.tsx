import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ExpenseManagementProps {
  forecastId?: number;
  isLoading: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const ExpenseManagement = ({ forecastId, isLoading }: ExpenseManagementProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Fetch expenses for the forecast
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

  // Process expenses by category
  const expensesByCategory = expenses?.reduce((acc, expense) => {
    const category = expense.category || "Other";
    const amount = Number(expense.amount);
    
    if (!acc[category]) {
      acc[category] = {
        name: category,
        value: 0,
        expenses: []
      };
    }
    
    acc[category].value += amount;
    acc[category].expenses.push(expense);
    
    return acc;
  }, {}) || {};
  
  // Convert to array and sort by value
  const expenseCategories = Object.values(expensesByCategory)
    .sort((a, b) => b.value - a.value);
  
  // Calculate total
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.value, 0);

  // Format expense data for the chart
  const chartData = expenseCategories.map((category, index) => ({
    ...category,
    color: COLORS[index % COLORS.length]
  }));

  if (isLoading || isLoadingExpenses) {
    return (
      <Card>
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        
        <CardContent className="p-5">
          <Skeleton className="h-40 w-full mb-5" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800">Expense Management</h3>
          <Button variant="link" className="text-primary p-0 h-auto">
            <Filter className="h-4 w-4 mr-1" /> Filter
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="mb-5">
          <div id="expense-chart" className="w-full h-40">
            {chartData.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-1">No expense data available</p>
                  <p className="text-xs text-gray-400">Add expenses to visualize your breakdown</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${Number(value).toLocaleString()}`} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          {chartData.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No expenses found</p>
              <Button className="mt-2" variant="outline" size="sm">
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <>
              {chartData.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium font-tabular text-gray-900">
                      ${category.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({Math.round(category.value / totalExpenses * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseManagement;
