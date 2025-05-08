import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface AccountsListProps {
  className?: string;
  realmId: string;
}

export function AccountsList({ className, realmId }: AccountsListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/quickbooks/accounts', realmId],
    enabled: !!realmId,
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Chart of Accounts</CardTitle>
        <CardDescription>Your QuickBooks accounts list</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/10">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error instanceof Error ? error.message : 'Failed to load account data'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && data && data.accounts && (
          <div className="space-y-6">
            {/* Assets */}
            <AccountSection 
              title="Assets" 
              accounts={data.accounts.filter((account: any) => account.classification === 'Asset')} 
            />
            
            {/* Liabilities */}
            <AccountSection 
              title="Liabilities" 
              accounts={data.accounts.filter((account: any) => account.classification === 'Liability')} 
            />
            
            {/* Equity */}
            <AccountSection 
              title="Equity" 
              accounts={data.accounts.filter((account: any) => account.classification === 'Equity')} 
            />
            
            {/* Income */}
            <AccountSection 
              title="Income" 
              accounts={data.accounts.filter((account: any) => account.classification === 'Revenue')} 
            />
            
            {/* Expenses */}
            <AccountSection 
              title="Expenses" 
              accounts={data.accounts.filter((account: any) => account.classification === 'Expense')} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AccountSectionProps {
  title: string;
  accounts: any[];
}

function AccountSection({ title, accounts }: AccountSectionProps) {
  if (!accounts || accounts.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <div className="border-b pb-2">
        <h3 className="text-md font-medium">{title}</h3>
      </div>
      <div className="space-y-1">
        {accounts.map((account) => (
          <div key={account.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{account.name}</span>
            <span>{account.currentBalance !== undefined ? formatCurrency(account.currentBalance) : 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}