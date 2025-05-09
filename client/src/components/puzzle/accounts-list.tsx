import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  
  const { data: accounts = [], isLoading, isError } = useQuery<PuzzleAccount[]>({
    queryKey: [`/api/puzzle/accounts/${user?.id || ''}`],
    enabled: !!workspaceId && !!user?.id,
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

  if (isError || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Your financial accounts from accounting integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 border border-dashed rounded-md flex flex-col items-center justify-center">
            <div className="text-center space-y-2 mb-4">
              <h3 className="font-semibold text-lg">No Accounts Connected</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Connect your accounting software to import your financial accounts or create a new account manually.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Connect Accounting
              </Button>
              <Button size="sm">
                <Link className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter accounts based on type
  const filteredAccounts = filter === 'all' 
    ? accounts 
    : accounts.filter((account: PuzzleAccount) => account.accountType === filter);

  // Get unique account types for filters
  const accountTypes = Array.from(new Set(accounts.map((account: PuzzleAccount) => account.accountType)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Your financial accounts from accounting integrations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            All
          </button>
          {accountTypes.map(type => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-sm rounded-full ${filter === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
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
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account: PuzzleAccount) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No accounts found matching the selected filter
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}