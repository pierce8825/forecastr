import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QuickbooksIntegrationData {
  isConnected: boolean;
  lastSynced?: Date;
  comparisonData?: {
    revenue: {
      percentage: number;
      isPositive: boolean;
    };
    expenses: {
      percentage: number;
      isPositive: boolean;
    };
    netIncome: {
      percentage: number;
      isPositive: boolean;
    };
  };
  transactions?: {
    id: string;
    description: string;
    category: string;
    amount: number;
    isIncome: boolean;
  }[];
}

interface QuickbooksIntegrationProps {
  data: QuickbooksIntegrationData;
  isLoading?: boolean;
  onRefreshData?: () => void;
  onSettings?: () => void;
  onViewDetailedReport?: () => void;
  onViewAllTransactions?: () => void;
  onConnectService?: (service: string) => void;
  onViewAllIntegrations?: () => void;
}

export const QuickbooksIntegration: React.FC<QuickbooksIntegrationProps> = ({
  data,
  isLoading = false,
  onRefreshData,
  onSettings,
  onViewDetailedReport,
  onViewAllTransactions,
  onConnectService,
  onViewAllIntegrations,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    return `${value < 0 ? "-" : value > 0 ? "+" : ""}$${absValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light mb-8">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-6 animate-pulse">
            <div className="h-6 bg-neutral-lighter w-48 rounded"></div>
            <div className="h-6 bg-neutral-lighter w-32 rounded"></div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-4 border border-neutral-light rounded-md animate-pulse">
              <div className="h-4 bg-neutral-lighter w-1/3 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-8 bg-neutral-lighter rounded"></div>
                <div className="h-8 bg-neutral-lighter rounded"></div>
                <div className="h-8 bg-neutral-lighter rounded"></div>
              </div>
            </div>
            <div className="flex-1 p-4 border border-neutral-light rounded-md animate-pulse">
              <div className="h-4 bg-neutral-lighter w-1/3 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-neutral-lighter rounded"></div>
                <div className="h-12 bg-neutral-lighter rounded"></div>
                <div className="h-12 bg-neutral-lighter rounded"></div>
              </div>
            </div>
            <div className="flex-1 p-4 border border-primary border-dashed rounded-md bg-blue-50 animate-pulse">
              <div className="h-40 bg-neutral-lighter bg-opacity-50 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light mb-8">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h3 className="font-medium text-neutral-darker">QuickBooks Integration</h3>
            <Badge 
              variant={data.isConnected ? "success" : "secondary"} 
              className={cn(
                "ml-2 rounded-full",
                data.isConnected 
                  ? "bg-success text-white" 
                  : "bg-neutral-light text-neutral-dark"
              )}
            >
              {data.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            {data.isConnected && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary font-medium"
                onClick={onRefreshData}
              >
                Refresh Data
              </Button>
            )}
            <button 
              className="text-neutral-dark hover:text-primary p-1"
              onClick={onSettings}
            >
              <MaterialIcon name="settings" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {data.isConnected && data.comparisonData && (
            <div className="flex-1 p-4 border border-neutral-light rounded-md">
              <h4 className="text-sm font-medium text-neutral-darker mb-3">Forecast vs. Actual</h4>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-dark">Revenue</span>
                  <span className={cn(
                    "text-xs",
                    data.comparisonData.revenue.isPositive ? "text-success" : "text-warning"
                  )}>
                    {formatPercentage(data.comparisonData.revenue.percentage)}
                  </span>
                </div>
                <div className="h-2 bg-neutral-lighter rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      data.comparisonData.revenue.isPositive ? "bg-success" : "bg-warning"
                    )} 
                    style={{ width: `${Math.min(Math.abs(data.comparisonData.revenue.percentage) + 100, 200)}%` }}
                  ></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-dark">Expenses</span>
                  <span className={cn(
                    "text-xs",
                    !data.comparisonData.expenses.isPositive ? "text-success" : "text-warning"
                  )}>
                    {formatPercentage(data.comparisonData.expenses.percentage)}
                  </span>
                </div>
                <div className="h-2 bg-neutral-lighter rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      !data.comparisonData.expenses.isPositive ? "bg-success" : "bg-warning"
                    )} 
                    style={{ width: `${Math.min(Math.abs(data.comparisonData.expenses.percentage) + 100, 200)}%` }}
                  ></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-neutral-dark">Net Income</span>
                  <span className={cn(
                    "text-xs",
                    data.comparisonData.netIncome.isPositive ? "text-success" : "text-error"
                  )}>
                    {formatPercentage(data.comparisonData.netIncome.percentage)}
                  </span>
                </div>
                <div className="h-2 bg-neutral-lighter rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      data.comparisonData.netIncome.isPositive ? "bg-success" : "bg-error"
                    )} 
                    style={{ width: `${Math.min(Math.abs(data.comparisonData.netIncome.percentage) + 100, 200)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs text-primary font-medium"
                  onClick={onViewDetailedReport}
                >
                  View Detailed Report
                </Button>
              </div>
            </div>
          )}
          
          {data.isConnected && data.transactions && data.transactions.length > 0 && (
            <div className="flex-1 p-4 border border-neutral-light rounded-md">
              <h4 className="text-sm font-medium text-neutral-darker mb-3">Latest Transactions</h4>
              <div className="space-y-3">
                {data.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-1 border-b border-neutral-lighter">
                    <div>
                      <div className="text-sm text-neutral-darker">{transaction.description}</div>
                      <div className="text-xs text-neutral-dark">{transaction.category}</div>
                    </div>
                    <div className={cn(
                      "text-sm",
                      transaction.isIncome ? "text-success" : "text-neutral-darker"
                    )}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs text-primary font-medium"
                  onClick={onViewAllTransactions}
                >
                  View All Transactions
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex-1 p-4 border border-primary border-dashed rounded-md bg-blue-50">
            <div className="text-center">
              <div className="text-primary text-lg mb-2">
                <MaterialIcon name="add_circle" />
              </div>
              <h4 className="text-sm font-medium text-neutral-darker mb-1">Connect More Data</h4>
              <p className="text-xs text-neutral-dark mb-4">Integrate with other sources for better forecasting</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  className="p-2 border border-neutral-light rounded bg-white text-neutral-darker text-xs hover:border-primary"
                  onClick={() => onConnectService && onConnectService("Stripe")}
                >
                  Stripe
                </button>
                <button 
                  className="p-2 border border-neutral-light rounded bg-white text-neutral-darker text-xs hover:border-primary"
                  onClick={() => onConnectService && onConnectService("Shopify")}
                >
                  Shopify
                </button>
                <button 
                  className="p-2 border border-neutral-light rounded bg-white text-neutral-darker text-xs hover:border-primary"
                  onClick={() => onConnectService && onConnectService("Xero")}
                >
                  Xero
                </button>
                <button 
                  className="p-2 border border-neutral-light rounded bg-white text-neutral-darker text-xs hover:border-primary"
                  onClick={() => onConnectService && onConnectService("Square")}
                >
                  Square
                </button>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-primary font-medium"
                onClick={onViewAllIntegrations}
              >
                View All Integrations
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
