import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Settings, Link } from 'lucide-react';

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

interface ReportSection {
  name: string;
  items: ReportItem[];
  total: number;
}

interface ReportData {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  sections: ReportSection[];
  total: number;
}

interface FinancialReportProps {
  workspaceId: string;
  reportType: ReportType;
}

export function FinancialReport({ workspaceId, reportType }: FinancialReportProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, isError } = useQuery<ReportData | null>({
    queryKey: [`/api/puzzle/reports/${user?.id || ''}/${reportType}`],
    enabled: !!workspaceId && !!user?.id,
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

  if (isError || !data || !data.sections || data.sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getReportTitle()}</CardTitle>
          <CardDescription>{getReportDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 border border-dashed rounded-md flex flex-col items-center justify-center">
            <div className="text-center space-y-2 mb-4">
              <h3 className="font-semibold text-lg">No Financial Data Available</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Connect your accounting software to import your financial data or create a forecast to generate financial reports.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Connect Accounting
              </Button>
              <Button size="sm">
                <Link className="h-4 w-4 mr-2" />
                Create a Forecast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              {data.subtitle}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(data.total)}
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
                  }).format(data.sections[0].total)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-md">
            <div className="p-3 border-b bg-muted/50">
              <div className="text-sm font-medium">{data.subtitle}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sections.map((section: ReportSection) => (
                  <React.Fragment key={section.name}>
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(section.total)}
                      </TableCell>
                    </TableRow>
                    {section.items.map((item: ReportItem) => (
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
                  </React.Fragment>
                ))}
                <TableRow className="font-bold">
                  <TableCell>
                    {reportType === ReportType.PROFIT_AND_LOSS ? 'Net Income' : 'Total'}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(data.total)}
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