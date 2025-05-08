import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";

interface QuickbooksFinancialReportProps {
  userId: number;
}

interface ReportItem {
  name: string;
  amount: number;
  items?: ReportItem[];
}

interface ProfitAndLossReport {
  income: ReportItem[];
  expenses: ReportItem[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

interface BalanceSheetReport {
  assets: ReportItem[];
  liabilities: ReportItem[];
  equity: ReportItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

interface FinancialReportResponse {
  report: ProfitAndLossReport | BalanceSheetReport;
}

export function QuickbooksFinancialReport({ userId }: QuickbooksFinancialReportProps) {
  const [reportType, setReportType] = useState<string>("profit_loss");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -90),
    to: new Date(),
  });
  
  const formatDateForApi = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  const { data, isLoading, error, isFetching } = useQuery<FinancialReportResponse>({
    queryKey: [
      '/api/quickbooks/reports', 
      userId, 
      reportType, 
      formatDateForApi(dateRange?.from), 
      formatDateForApi(dateRange?.to)
    ],
    enabled: !!userId && !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleExport = () => {
    // Export functionality would be implemented here
    alert("Export functionality will be implemented in a future update.");
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>View your QuickBooks financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="mt-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>View your QuickBooks financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading reports</AlertTitle>
            <AlertDescription>
              There was a problem loading your QuickBooks financial reports. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Render financial line items with indentation based on level
  const renderLineItems = (items: any[] = [], level = 0) => {
    if (!items || items.length === 0) return null;
    
    return items.map((item, index) => (
      <div key={`${item.name}-${index}`} className="py-1">
        <div className="flex justify-between">
          <div 
            style={{ paddingLeft: `${level * 16}px` }}
            className={level === 0 ? "font-medium" : "text-sm"}
          >
            {item.name}
          </div>
          <div className={`font-mono text-sm ${item.amount < 0 ? 'text-red-600' : ''}`}>
            {formatCurrency(item.amount)}
          </div>
        </div>
        {item.items && renderLineItems(item.items, level + 1)}
      </div>
    ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
        <CardDescription>View your QuickBooks financial reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs 
              defaultValue="profit_loss" 
              value={reportType} 
              onValueChange={setReportType}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profit_loss">Profit & Loss</TabsTrigger>
                <TabsTrigger value="balance_sheet">Balance Sheet</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              className="w-full sm:w-auto"
              align="end"
            />
          </div>
          
          {isFetching ? (
            <div className="py-8 flex justify-center">
              <div className="animate-pulse text-muted-foreground">Loading report data...</div>
            </div>
          ) : !data ? (
            <div className="py-8 text-center text-muted-foreground">
              No report data available for the selected period.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {reportType === "profit_loss" ? "Profit & Loss" : "Balance Sheet"}
                </h3>
                <Button 
                  onClick={handleExport} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>
              
              <div className="divide-y">
                {reportType === "profit_loss" ? (
                  <>
                    <div className="py-3">
                      <h4 className="font-medium mb-2">Revenue</h4>
                      {data?.report && 'income' in data.report && 
                        renderLineItems(data.report.income)}
                      
                      <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                        <div>Total Revenue</div>
                        <div className="font-mono">
                          {formatCurrency(
                            data?.report && 'totalIncome' in data.report 
                              ? data.report.totalIncome 
                              : 0
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3">
                      <h4 className="font-medium mb-2">Expenses</h4>
                      {data?.report && 'expenses' in data.report && 
                        renderLineItems(data.report.expenses)}
                      
                      <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                        <div>Total Expenses</div>
                        <div className="font-mono">
                          {formatCurrency(
                            data?.report && 'totalExpenses' in data.report 
                              ? data.report.totalExpenses 
                              : 0
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3">
                      <div className="flex justify-between font-bold">
                        <div>Net Income</div>
                        <div className={`font-mono ${
                          data?.report && 'netIncome' in data.report && data.report.netIncome < 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {formatCurrency(
                            data?.report && 'netIncome' in data.report 
                              ? data.report.netIncome 
                              : 0
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-3">
                      <h4 className="font-medium mb-2">Assets</h4>
                      {data?.report && 'assets' in data.report && 
                        renderLineItems(data.report.assets)}
                      
                      <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                        <div>Total Assets</div>
                        <div className="font-mono">
                          {formatCurrency(
                            data?.report && 'totalAssets' in data.report 
                              ? data.report.totalAssets 
                              : 0
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3">
                      <h4 className="font-medium mb-2">Liabilities</h4>
                      {data?.report && 'liabilities' in data.report && 
                        renderLineItems(data.report.liabilities)}
                      
                      <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                        <div>Total Liabilities</div>
                        <div className="font-mono">
                          {formatCurrency(
                            data?.report && 'totalLiabilities' in data.report 
                              ? data.report.totalLiabilities 
                              : 0
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3">
                      <h4 className="font-medium mb-2">Equity</h4>
                      {data?.report && 'equity' in data.report && 
                        renderLineItems(data.report.equity)}
                      
                      <div className="flex justify-between mt-2 border-t pt-2 font-medium">
                        <div>Total Equity</div>
                        <div className="font-mono">
                          {formatCurrency(
                            data?.report && 'totalEquity' in data.report 
                              ? data.report.totalEquity 
                              : 0
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3">
                      <div className="flex justify-between font-bold">
                        <div>Total Liabilities and Equity</div>
                        <div className="font-mono">
                          {formatCurrency(
                            (data?.report && 'totalLiabilities' in data.report ? data.report.totalLiabilities : 0) +
                            (data?.report && 'totalEquity' in data.report ? data.report.totalEquity : 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}