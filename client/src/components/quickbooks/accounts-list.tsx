import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";

interface Account {
  Id: string;
  Name: string;
  AccountType: string;
  AccountSubType: string;
  Classification: string;
  CurrentBalance: number;
  CurrentBalanceWithSubAccounts: number;
  Active: boolean;
}

export function QuickbooksAccountsList({ userId }: { userId: number }) {
  const [activeTab, setActiveTab] = useState("income");
  
  // Query for income accounts
  const incomeQuery = useQuery<Account[]>({
    queryKey: ["/api/quickbooks/accounts/income", userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/quickbooks/accounts/income/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch income accounts");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching income accounts:", error);
        throw error;
      }
    },
    enabled: activeTab === "income",
  });
  
  // Query for expense accounts
  const expenseQuery = useQuery<Account[]>({
    queryKey: ["/api/quickbooks/accounts/expense", userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/quickbooks/accounts/expense/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch expense accounts");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching expense accounts:", error);
        throw error;
      }
    },
    enabled: activeTab === "expense",
  });
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QuickBooks Accounts</span>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </CardTitle>
        <CardDescription>
          View and manage your QuickBooks accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="income">Income Accounts</TabsTrigger>
            <TabsTrigger value="expense">Expense Accounts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income">
            {incomeQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : incomeQuery.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load income accounts. Please try again.
                </AlertDescription>
              </Alert>
            ) : incomeQuery.data && incomeQuery.data.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                  <div className="col-span-6">Account Name</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3 text-right">Balance</div>
                </div>
                <div className="divide-y">
                  {incomeQuery.data.map((account) => (
                    <div key={account.Id} className="grid grid-cols-12 p-3 text-sm">
                      <div className="col-span-6 font-medium">{account.Name}</div>
                      <div className="col-span-3 text-muted-foreground">{account.AccountSubType}</div>
                      <div className="col-span-3 text-right">
                        {formatCurrency(account.CurrentBalance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No income accounts found
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expense">
            {expenseQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : expenseQuery.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load expense accounts. Please try again.
                </AlertDescription>
              </Alert>
            ) : expenseQuery.data && expenseQuery.data.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                  <div className="col-span-6">Account Name</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3 text-right">Balance</div>
                </div>
                <div className="divide-y">
                  {expenseQuery.data.map((account) => (
                    <div key={account.Id} className="grid grid-cols-12 p-3 text-sm">
                      <div className="col-span-6 font-medium">{account.Name}</div>
                      <div className="col-span-3 text-muted-foreground">{account.AccountSubType}</div>
                      <div className="col-span-3 text-right">
                        {formatCurrency(account.CurrentBalance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No expense accounts found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}