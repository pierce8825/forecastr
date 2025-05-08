import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Account {
  Id: string;
  Name: string;
  AccountType: string;
  AccountSubType: string;
  CurrentBalance: number;
  Active: boolean;
}

interface AccountsResponse {
  accounts: Account[];
}

interface QuickbooksAccountsListProps {
  userId: number;
}

export function QuickbooksAccountsList({ userId }: QuickbooksAccountsListProps) {
  const [accountType, setAccountType] = useState<string>("all");
  
  const { data, isLoading, error } = useQuery<AccountsResponse>({
    queryKey: ['/api/quickbooks/accounts', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter accounts by type
  const filteredAccounts = accountType === "all" 
    ? data?.accounts
    : data?.accounts?.filter((account) => account.AccountType === accountType);
  
  // Get unique account types for filter
  const accountTypes = data?.accounts
    ? ["all", ...Array.from(new Set(data.accounts.map((account) => account.AccountType)))]
    : ["all"];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QuickBooks Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between border-b pb-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QuickBooks Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading accounts</AlertTitle>
            <AlertDescription>
              There was a problem loading your QuickBooks accounts. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>QuickBooks Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {!data?.accounts || data.accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No accounts found in your QuickBooks Online account.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {accountTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                    accountType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {type === "all" ? "All Accounts" : type}
                </button>
              ))}
            </div>
            
            <div className="divide-y">
              {filteredAccounts?.map((account: Account) => (
                <div key={account.Id} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{account.Name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{account.AccountType}</span>
                      {account.AccountSubType && (
                        <>
                          <span>•</span>
                          <span>{account.AccountSubType}</span>
                        </>
                      )}
                      {!account.Active && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`font-mono text-sm ${account.CurrentBalance < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(account.CurrentBalance)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}