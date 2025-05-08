import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';

// Assuming user context or state management provides the user ID
// For simplicity, we're using a hardcoded value
const USER_ID = 1;

export enum ReportType {
  PROFIT_AND_LOSS = 'profit-and-loss',
  BALANCE_SHEET = 'balance-sheet',
  CASH_FLOW = 'cash-flow',
}

interface ReportItem {
  name: string;
  amount: number;
  detail?: ReportItem[];
}

interface ReportData {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  sections: {
    name: string;
    items: ReportItem[];
    total: number;
  }[];
  total: number;
}

interface FinancialReportProps {
  workspaceId: string;
  reportType: ReportType;
}

export function FinancialReport({ workspaceId, reportType }: FinancialReportProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['/api/puzzle/reports', USER_ID, reportType],
    queryFn: () => apiRequest(`/api/puzzle/reports/${USER_ID}/${reportType}?startDate=2025-01-01&endDate=2025-05-01`),
    enabled: !!workspaceId,
  });

  // Generate title based on report type
  const getReportTitle = () => {
    switch (reportType) {
      case ReportType.PROFIT_AND_LOSS:
        return 'Profit and Loss Statement';
      case ReportType.BALANCE_SHEET:
        return 'Balance Sheet';
      case ReportType.CASH_FLOW:
        return 'Cash Flow Statement';
      default:
        return 'Financial Report';
    }
  };

  // Generate description based on report type
  const getReportDescription = () => {
    switch (reportType) {
      case ReportType.PROFIT_AND_LOSS:
        return 'Shows your revenue, expenses, and profit over time';
      case ReportType.BALANCE_SHEET:
        return 'Shows your assets, liabilities, and equity';
      case ReportType.CASH_FLOW:
        return 'Shows how cash moves in and out of your business';
      default:
        return 'Financial data from your Puzzle.io account';
    }
  };

  if (!workspaceId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getReportTitle()}</CardTitle>
          <CardDescription>{getReportDescription()}</CardDescription>
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
          <CardTitle>{getReportTitle()}</CardTitle>
          <CardDescription>{getReportDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
            There was an error loading your {getReportTitle().toLowerCase()} from Puzzle.io. Please try again later or reconnect your account.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock financial report data
  const mockProfitLossData: ReportData = {
    title: 'Profit and Loss Statement',
    subtitle: 'January 1, 2025 - May 1, 2025',
    startDate: '2025-01-01',
    endDate: '2025-05-01',
    sections: [
      {
        name: 'Income',
        items: [
          { name: 'Sales Revenue', amount: 450000 },
          { name: 'Service Revenue', amount: 175000 },
          { name: 'Subscription Revenue', amount: 225000 },
        ],
        total: 850000,
      },
      {
        name: 'Cost of Goods Sold',
        items: [
          { name: 'Materials', amount: 125000 },
          { name: 'Labor', amount: 175000 },
          { name: 'Overhead', amount: 50000 },
        ],
        total: 350000,
      },
      {
        name: 'Expenses',
        items: [
          { name: 'Salaries and Wages', amount: 200000 },
          { name: 'Rent and Utilities', amount: 35000 },
          { name: 'Marketing', amount: 45000 },
          { name: 'Software and Technology', amount: 20000 },
          { name: 'Professional Services', amount: 15000 },
        ],
        total: 315000,
      },
    ],
    total: 185000, // Income - COGS - Expenses
  };

  const mockBalanceSheetData: ReportData = {
    title: 'Balance Sheet',
    subtitle: 'As of May 1, 2025',
    startDate: '2025-01-01',
    endDate: '2025-05-01',
    sections: [
      {
        name: 'Assets',
        items: [
          { name: 'Cash and Equivalents', amount: 250000 },
          { name: 'Accounts Receivable', amount: 175000 },
          { name: 'Inventory', amount: 125000 },
          { name: 'Property and Equipment', amount: 350000 },
        ],
        total: 900000,
      },
      {
        name: 'Liabilities',
        items: [
          { name: 'Accounts Payable', amount: 85000 },
          { name: 'Loans Payable', amount: 250000 },
          { name: 'Accrued Expenses', amount: 45000 },
        ],
        total: 380000,
      },
      {
        name: 'Equity',
        items: [
          { name: 'Owner Capital', amount: 400000 },
          { name: 'Retained Earnings', amount: 120000 },
        ],
        total: 520000,
      },
    ],
    total: 900000, // Assets = Liabilities + Equity
  };

  // Select the appropriate mock data based on report type
  const reportData = reportType === ReportType.PROFIT_AND_LOSS 
    ? mockProfitLossData 
    : mockBalanceSheetData;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getReportTitle()}</CardTitle>
            <CardDescription>{getReportDescription()}</CardDescription>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary underline"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {!isExpanded ? (
          <div className="p-4 border rounded-md bg-card">
            <div className="text-sm text-muted-foreground mb-2">
              {reportData.subtitle}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(reportData.total)}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {reportType === ReportType.PROFIT_AND_LOSS ? 'Net Income' : 'Total Assets'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {reportType === ReportType.PROFIT_AND_LOSS ? 'Revenue' : 'Total Liabilities'}
                </div>
                <div className="text-lg">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(reportData.sections[0].total)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-md">
            <div className="p-3 border-b bg-muted/50">
              <div className="text-sm font-medium">{reportData.subtitle}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.sections.map((section) => (
                  <>
                    <TableRow key={section.name} className="bg-muted/30">
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(section.total)}
                      </TableCell>
                    </TableRow>
                    {section.items.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="pl-8">{item.name}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
                <TableRow className="font-bold">
                  <TableCell>
                    {reportType === ReportType.PROFIT_AND_LOSS ? 'Net Income' : 'Total'}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(reportData.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}