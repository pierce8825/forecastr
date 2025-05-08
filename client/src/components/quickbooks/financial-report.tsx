import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, TrendingUp } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addMonths, format, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DateRange {
  from: Date;
  to: Date;
}

interface ReportRow {
  label: string;
  value: number;
  type: 'header' | 'subheader' | 'item' | 'total';
}

export function QuickbooksFinancialReport({ userId }: { userId: number }) {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(today, 3),
    to: today,
  });
  const [activeTab, setActiveTab] = useState("profit-loss");
  
  // Query for profit and loss report
  const profitLossQuery = useQuery({
    queryKey: ["/api/quickbooks/reports/profit-loss", userId, dateRange],
    queryFn: async () => {
      try {
        const startDate = format(dateRange.from, 'yyyy-MM-dd');
        const endDate = format(dateRange.to, 'yyyy-MM-dd');
        
        const res = await fetch(
          `/api/quickbooks/reports/profit-loss/${userId}?startDate=${startDate}&endDate=${endDate}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch profit and loss report");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching profit and loss report:", error);
        throw error;
      }
    },
    enabled: activeTab === "profit-loss" && !!dateRange.from && !!dateRange.to,
  });
  
  // Format the report data
  const formatReportData = (report: any): ReportRow[] => {
    if (!report || !report.Rows || !report.Rows.Row) return [];
    
    const rows: ReportRow[] = [];
    
    const processRow = (row: any, depth = 0) => {
      if (row.Summary) {
        // Header row
        rows.push({
          label: row.Summary.ColData[0].value,
          value: parseFloat(row.Summary.ColData[1].value),
          type: depth === 0 ? 'header' : 'subheader',
        });
      }
      
      // Process rows
      if (row.Rows && row.Rows.Row) {
        const subRows = Array.isArray(row.Rows.Row) ? row.Rows.Row : [row.Rows.Row];
        subRows.forEach((subRow: any) => {
          processRow(subRow, depth + 1);
        });
      }
      
      // Process individual items
      if (row.ColData) {
        rows.push({
          label: row.ColData[0].value,
          value: parseFloat(row.ColData[1].value || '0'),
          type: row.type === 'Total' ? 'total' : 'item',
        });
      }
    };
    
    const rootRows = Array.isArray(report.Rows.Row) ? report.Rows.Row : [report.Rows.Row];
    rootRows.forEach((row: any) => processRow(row));
    
    return rows;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };
  
  const reportData = profitLossQuery.data ? formatReportData(profitLossQuery.data) : [];
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            <span>Financial Reports</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </CardTitle>
        <CardDescription>
          View your QuickBooks financial reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
              <TabsTrigger value="balance-sheet" disabled>Balance Sheet</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DatePickerWithRange 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange} 
          />
        </div>
        
        <TabsContent value="profit-loss" className="mt-0">
          {profitLossQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : profitLossQuery.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load profit and loss report. Please try again.
              </AlertDescription>
            </Alert>
          ) : reportData.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                <div className="col-span-9">Account</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              <div className="divide-y">
                {reportData.map((row, index) => (
                  <div 
                    key={index} 
                    className={`grid grid-cols-12 p-3 text-sm ${
                      row.type === 'header' 
                        ? 'font-bold bg-muted/30' 
                        : row.type === 'subheader' 
                          ? 'font-semibold' 
                          : row.type === 'total' 
                            ? 'font-medium border-t' 
                            : ''
                    }`}
                  >
                    <div className={`col-span-9 ${
                      row.type === 'item' ? 'pl-4' : ''
                    }`}>{row.label}</div>
                    <div className="col-span-3 text-right">
                      {formatCurrency(row.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No financial data available for the selected period
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
}