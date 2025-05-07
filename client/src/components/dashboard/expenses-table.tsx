import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExpenseCategoryData {
  id: string;
  name: string;
  currentMonth: number;
  ytd: number;
  percentOfRevenue: number;
}

interface ExpensesTableProps {
  categories: ExpenseCategoryData[];
  isLoading?: boolean;
  onAddCategory?: () => void;
  onEditCategory?: (id: string) => void;
  onMoreOptions?: () => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  categories,
  isLoading = false,
  onAddCategory,
  onEditCategory,
  onMoreOptions,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-neutral-darker">Expense Categories</h3>
            <div className="flex items-center space-x-3">
              <Button variant="link" size="sm" disabled>Add Category</Button>
              <button className="text-neutral-dark p-1" disabled>
                <MaterialIcon name="more_horiz" />
              </button>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-lighter rounded mb-2"></div>
            <div className="h-60 bg-neutral-lighter rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-neutral-darker">Expense Categories</h3>
          <div className="flex items-center space-x-3">
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary font-medium"
              onClick={onAddCategory}
            >
              Add Category
            </Button>
            <button 
              className="text-neutral-dark hover:text-primary p-1"
              onClick={onMoreOptions}
            >
              <MaterialIcon name="more_horiz" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">Current Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">YTD</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">% of Revenue</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-light">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-neutral-lighter">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-darker">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-dark">
                    {formatCurrency(category.currentMonth)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-dark">
                    {formatCurrency(category.ytd)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-neutral-dark">
                    {formatPercentage(category.percentOfRevenue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <button 
                      className="text-primary hover:text-primary-dark"
                      onClick={() => onEditCategory(category.id)}
                    >
                      <MaterialIcon name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
