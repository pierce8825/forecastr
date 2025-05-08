import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { formatCurrency } from '@/lib/utils';

interface ReportItem {
  name: string;
  amount: number;
}

interface FinancialReportData {
  report: {
    income?: ReportItem[];
    expenses?: ReportItem[];
    assets?: ReportItem[];
    liabilities?: ReportItem[];
    equity?: ReportItem[];
    totalIncome?: number;
    totalExpenses?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
  };
}

export enum ReportType {
  PROFIT_AND_LOSS = 'PROFIT_AND_LOSS',
  BALANCE_SHEET = 'BALANCE_SHEET'
}

interface FinancialReportProps {
  className?: string;
  realmId: string;
  reportType: ReportType;
}

export function FinancialReport({ className, realmId, reportType }: FinancialReportProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const formattedFromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const formattedToDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  const { data, isLoading, error } = useQuery<FinancialReportData>({
    queryKey: ['/api/quickbooks/reports', reportType, realmId, formattedFromDate, formattedToDate],
    enabled: !!realmId && !!dateRange?.from && !!dateRange?.to,
  });

  const formatReportTitle = () => {
    switch (reportType) {
      case ReportType.PROFIT_AND_LOSS:
        return 'Profit and Loss';
      case ReportType.BALANCE_SHEET:
        return 'Balance Sheet';
      default:
        return 'Financial Report';
    }
  };

  const formatReportDescription = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Select a date range';
    return `${format(dateRange.from, 'MMM dd, yyyy')} to ${format(dateRange.to, 'MMM dd, yyyy')}`;
  };

  // Extract report sections from the response data
  const sections = useMemo(() => {
    if (!data || !data.report) return [];

    if (reportType === ReportType.PROFIT_AND_LOSS) {
      return [
        {
          title: 'Income',
          data: data.report.income || [],
          total: data.report.totalIncome || 0
        },
        {
          title: 'Expenses',
          data: data.report.expenses || [],
          total: data.report.totalExpenses || 0
        },
      ];
    } else if (reportType === ReportType.BALANCE_SHEET) {
      return [
        {
          title: 'Assets',
          data: data.report.assets || [],
          total: data.report.totalAssets || 0
        },
        {
          title: 'Liabilities',
          data: data.report.liabilities || [],
          total: data.report.totalLiabilities || 0
        },
        {
          title: 'Equity',
          data: data.report.equity || [],
          total: data.report.totalEquity || 0
        },
      ];
    }

    return [];
  }, [data, reportType]);

  // Calculate total values
  const netIncome = useMemo(() => {
    if (!data || !data.report) return 0;
    if (reportType === ReportType.PROFIT_AND_LOSS) {
      return (data.report.totalIncome || 0) - (data.report.totalExpenses || 0);
    }
    return 0;
  }, [data, reportType]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <CardTitle>{formatReportTitle()}</CardTitle>
            <CardDescription>{formatReportDescription()}</CardDescription>
          </div>
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            align="end"
          />
        </div>
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
                  {error instanceof Error ? error.message : 'Failed to load financial data'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && data && (
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-md font-medium">{section.title}</h3>
                  <span className="text-md font-medium">{formatCurrency(section.total)}</span>
                </div>
                <div className="space-y-1">
                  {section.data.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {reportType === ReportType.PROFIT_AND_LOSS && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between font-medium">
                  <h3 className="text-lg">Net Income</h3>
                  <span className={`text-lg ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(netIncome)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}