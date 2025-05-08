import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';

// Assuming user context or state management provides the user ID
// For simplicity, we're using a hardcoded value
const USER_ID = 1;

export interface PuzzleAccount {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  currency: string;
}

interface AccountsListProps {
  workspaceId: string;
}

export function AccountsList({ workspaceId }: AccountsListProps) {
  const [filter, setFilter] = useState('all');
  
  const { data: accounts, isLoading, isError } = useQuery({
    queryKey: [`/api/puzzle/accounts/${USER_ID}`],
    enabled: !!workspaceId,
  });

  if (!workspaceId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Loading your financial accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Failed to load accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
            There was an error loading your accounts from Puzzle.io. Please try again later or reconnect your account.
          </div>
        </CardContent>
      </Card>
    );
  }

  // In a real implementation, this would be provided by the API
  // For now, we'll just return placeholder accounts data
  const placeholderAccounts: PuzzleAccount[] = [
    {
      id: '1',
      name: 'Business Checking',
      accountType: 'BANK',
      balance: 25000.00,
      currency: 'USD'
    },
    {
      id: '2',
      name: 'Business Savings',
      accountType: 'BANK',
      balance: 150000.00,
      currency: 'USD'
    },
    {
      id: '3',
      name: 'Accounts Receivable',
      accountType: 'ACCOUNTS_RECEIVABLE',
      balance: 45000.00,
      currency: 'USD'
    },
    {
      id: '4',
      name: 'Accounts Payable',
      accountType: 'ACCOUNTS_PAYABLE',
      balance: -15000.00,
      currency: 'USD'
    },
    {
      id: '5',
      name: 'Revenue',
      accountType: 'REVENUE',
      balance: 250000.00,
      currency: 'USD'
    }
  ];

  // Filter accounts based on type
  const filteredAccounts = filter === 'all' 
    ? placeholderAccounts 
    : placeholderAccounts.filter(account => account.accountType === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Your financial accounts from Puzzle.io</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('BANK')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'BANK' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            Bank
          </button>
          <button 
            onClick={() => setFilter('ACCOUNTS_RECEIVABLE')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'ACCOUNTS_RECEIVABLE' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            Receivable
          </button>
          <button 
            onClick={() => setFilter('ACCOUNTS_PAYABLE')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'ACCOUNTS_PAYABLE' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            Payable
          </button>
          <button 
            onClick={() => setFilter('REVENUE')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'REVENUE' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            Revenue
          </button>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary">
                      {account.accountType.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right ${account.balance < 0 ? 'text-red-600' : ''}`}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: account.currency
                    }).format(account.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}